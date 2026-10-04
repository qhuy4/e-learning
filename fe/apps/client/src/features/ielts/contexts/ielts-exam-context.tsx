import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useExamDetail } from "../../exams/hooks";
import { examService } from "../../exams/services/exam.service";
import type { ExamAttempt, ExamSection, SubmitExamAnswerDto } from "../../exams/types";
import { MODULE_META, READING_PASSAGES } from "../constants";
import { getIeltsApiSource, syncIeltsApiSource } from "../data/source";
import { speakingUiId } from "../data/api-source";
import { IELTS_SPEAKING_PARTS, speakingQuestionTotal } from "../mocks/speaking-data";
import { SCOPE_PARAM } from "../scope";
import type { IeltsModule, IeltsResult, IeltsScope, ObjectiveModule } from "../types";
import {
  clearAutoSave,
  computeIeltsResult,
  loadSubmittedSnapshot,
  readAutoSave,
  rebuildIeltsAnswersFromRows,
  writeAutoSave,
} from "../utils";

/** Thông tin đề thật (API) đang mở — null khi làm mock. */
export interface IeltsApiExam {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  /** Section thật của đề — suy kỹ năng/số câu cho landing + instructions. */
  sections: ExamSection[];
}

/** Giữ examId giữa các trang (instructions → test → review → result). */
const EXAM_ID_KEY = "ielts:api-exam-id";
/** AttemptId đang dở dang — xóa sau khi nộp bài thành công. */
const ATTEMPT_KEY = "ielts:attempt-id";

function parsePositiveInt(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function readSessionNumber(key: string): number | null {
  try {
    return parsePositiveInt(window.sessionStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeSessionNumber(key: string, value: number | null): void {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, String(value));
  } catch {
    /* storage unavailable (private mode) — cứ tiếp tục ở chế độ không persist */
  }
}

/**
 * Attempt đang dở dang lưu dạng "examId:attemptId" để KHÔNG BAO GIỜ nộp nhầm
 * đáp án của đề A vào lượt thi của đề B (server sẽ bỏ mọi câu hỏi lạ).
 */
function readSessionAttempt(examId: number | null): number | null {
  if (examId === null) return null;
  try {
    const raw = window.sessionStorage.getItem(ATTEMPT_KEY);
    if (!raw || !raw.includes(":")) return null;
    const [examPart, attemptPart] = raw.split(":");
    const storedExam = Number(examPart);
    const attempt = Number(attemptPart);
    if (storedExam !== examId) return null;
    return Number.isInteger(attempt) && attempt > 0 ? attempt : null;
  } catch {
    return null;
  }
}

function writeSessionAttempt(examId: number, attemptId: number | null): void {
  try {
    if (attemptId === null) window.sessionStorage.removeItem(ATTEMPT_KEY);
    else window.sessionStorage.setItem(ATTEMPT_KEY, `${examId}:${attemptId}`);
  } catch {
    /* storage unavailable — rơi về trạng thái chưa có lượt thi */
  }
}

/** Speaking countdown runs per part (Part 1: 5', Part 2: 4', Part 3: 5'). */
function speakingPartSeconds(part: number): number {
  const found = IELTS_SPEAKING_PARTS.find((p) => p.part === part);
  return (found?.durationMinutes ?? 5) * 60;
}

interface IeltsExamContextValue {
  answers: Record<number, string>;
  flags: Record<number, boolean>;
  /** Ghi chú của học viên theo câu hỏi (không gắn với đáp án, được phép ghi cả khi xem lại). */
  notes: Record<number, string>;
  /** Writing drafts keyed by task (1 | 2). */
  drafts: Record<number, string>;
  /** Currently focused question per objective module. */
  current: Record<ObjectiveModule, number>;
  writingTask: number;
  speakingPart: 1 | 2 | 3;
  /** Index of the question being spoken per part. */
  speakingIndex: Record<number, number>;
  speakingAnswered: Record<string, boolean>;
  speakingTranscript: Record<string, string>;
  /** Blob URL bản ghi âm theo CÂU (qid) — chỉ sống trong phiên (F5 mất file). */
  speakingAudio: Record<string, string | undefined>;
  speakingNotes: string;
  timeLeft: Record<IeltsModule, number>;
  started: Record<IeltsModule, boolean>;
  /** Practice scope per skill (group ids) — empty / missing = whole module. */
  scope: IeltsScope;
  fontScale: number;
  savedAt: number | null;
  result: IeltsResult | null;

  selectAnswer: (questionId: number, value: string) => void;
  toggleFlag: (questionId: number) => void;
  setNote: (questionId: number, text: string) => void;
  setDraft: (taskId: number, text: string) => void;
  setCurrent: (module: ObjectiveModule, questionId: number) => void;
  /** Restricts a skill to the given group ids (sections / passages / tasks / parts). */
  setScope: (module: IeltsModule, groups: number[]) => void;
  setWritingTask: (taskId: number) => void;
  setSpeakingPart: (part: 1 | 2 | 3) => void;
  setSpeakingIndex: (part: number, index: number) => void;
  markSpeakingAnswered: (questionId: string) => void;
  /** Bỏ dấu đã trả lời (người dùng "Ghi lại") — bộ đếm câu này về 0. */
  unmarkSpeakingAnswered: (questionId: string) => void;
  setSpeakingTranscript: (questionId: string, text: string) => void;
  /** Gán (url) / xoá (null) bản ghi của CÂU — revoke URL cũ khi thay thế. */
  setSpeakingAudio: (questionId: string, url: string | null) => void;
  setSpeakingNotes: (text: string) => void;
  startModule: (module: IeltsModule) => void;
  setFontScale: (scale: number) => void;
  saveNow: () => void;
  submitExam: () => IeltsResult;
  /** Đang nối API (có ?examId) thay vì dữ liệu mock. */
  isApiMode: boolean;
  /**
   * Chế độ XEM LẠI bài đã nộp (`?review=1` trên route làm bài) — tái sử dụng
   * chính trang đề thi: chỉ đọc, không chọn đáp án, không tính giờ, audio nghe
   * lại được và đáp án hiện dưới mỗi câu.
   */
  reviewMode: boolean;
  /** Đề thật từ API — null ở mock mode. */
  apiExam: IeltsApiExam | null;
  /** Tạo lượt thi trên máy chủ (idempotent, dedupe theo promise). */
  startAttempt: () => Promise<number>;
  /** Nộp bài lên API (objective + essay + speaking transcript). No-op khi mock. */
  submitToServer: () => Promise<ExamAttempt | null>;
}

const IeltsExamContext = createContext<IeltsExamContextValue | null>(null);

export function useIeltsExam(): IeltsExamContextValue {
  const ctx = useContext(IeltsExamContext);
  if (!ctx) throw new Error("useIeltsExam must be used within <IeltsExamProvider>");
  return ctx;
}

const INITIAL_TIME: Record<IeltsModule, number> = {
  listening: MODULE_META.listening.minutes * 60,
  reading: MODULE_META.reading.minutes * 60,
  writing: MODULE_META.writing.minutes * 60,
  speaking: speakingPartSeconds(1),
};

const INITIAL_CURRENT: Record<ObjectiveModule, number> = { listening: 1, reading: 41 };

/**
 * Shared IELTS exam state: answers, flags, writing drafts, speaking progress,
 * per-module countdown timers and the computed band report. UI-only (no API).
 */
export function IeltsExamProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [current, setCurrentState] = useState<Record<ObjectiveModule, number>>(INITIAL_CURRENT);
  const [writingTask, setWritingTaskState] = useState(1);
  const [speakingPart, setSpeakingPartState] = useState<1 | 2 | 3>(1);
  const [speakingIndex, setSpeakingIndexState] = useState<Record<number, number>>({});
  const [speakingAnswered, setSpeakingAnswered] = useState<Record<string, boolean>>({});
  const [speakingTranscript, setSpeakingTranscriptState] = useState<Record<string, string>>({});
  const [speakingAudio, setSpeakingAudioState] = useState<Record<string, string | undefined>>({});
  const [speakingNotes, setSpeakingNotesState] = useState("");
  const [started, setStarted] = useState<Record<IeltsModule, boolean>>({
    listening: false,
    reading: false,
    writing: false,
    speaking: false,
  });
  const [timeLeft, setTimeLeft] = useState<Record<IeltsModule, number>>(INITIAL_TIME);
  const [scope, setScopeState] = useState<IeltsScope>({});
  const [fontScale, setFontScaleState] = useState(1);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [result, setResult] = useState<IeltsResult | null>(null);

  // ---------------------------------------------------- Chế độ API (?examId=…)
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const urlExamId = parsePositiveInt(searchParams.get("examId"));
  /** Xem lại bài đã nộp: `?review=1` trên route làm bài (chỉ đọc). */
  const reviewMode = searchParams.get("review") === "1";
  const isEntryRoute = pathname.includes("/instructions");
  // Vào trang hướng dẫn KHÔNG kèm examId → bắt đầu lần mới bằng mock.
  if (isEntryRoute && urlExamId === null) {
    if (readSessionNumber(EXAM_ID_KEY) !== null) writeSessionNumber(EXAM_ID_KEY, null);
    // Attempt lưu theo cặp "examId:attemptId" — vào mock là bỏ luôn lượt cũ.
    writeSessionAttempt(0, null);
  }
  const examId = urlExamId ?? (isEntryRoute ? null : readSessionNumber(EXAM_ID_KEY));
  const isApiMode = examId !== null;

  useEffect(() => {
    if (urlExamId !== null) writeSessionNumber(EXAM_ID_KEY, urlExamId);
  }, [urlExamId]);

  // ------------------------------------------- Auto-save (F5 không mất bài)
  // 1) Đọc bản đã lưu của đề này khi mount / đổi đề — chạy TRƯỚC các effect
  //    ghi để không ghi đè bản lưu bằng object rỗng lúc mount.
  useEffect(() => {
    setAnswers(readAutoSave<Record<number, string>>("answers", examId, {}));
    setFlags(readAutoSave<Record<number, boolean>>("flags", examId, {}));
    setDrafts(readAutoSave<Record<number, string>>("drafts", examId, {}));
    setNotes(readAutoSave<Record<number, string>>("notes", examId, {}));
    // Speaking per-question: cờ đã ghi âm + transcript sống qua F5 (file audio
    // là blob URL — mất khi reload, UI sẽ hiện chú thích "hết phiên" trung thực).
    const speakingSave = readAutoSave<{
      answered: Record<string, boolean>;
      transcript: Record<string, string>;
    }>("speaking", examId, { answered: {}, transcript: {} });
    setSpeakingAnswered(speakingSave.answered);
    setSpeakingTranscriptState(speakingSave.transcript);
  }, [examId]);
  // 2) Ghi ngược lại sessionStorage mỗi khi state đổi (xem lại bài KHÔNG ghi —
  //    không làm bẩn auto-save của lượt thi mới).
  useEffect(() => {
    if (reviewMode) return;
    writeAutoSave("answers", examId, answers);
  }, [examId, answers, reviewMode]);
  useEffect(() => {
    if (reviewMode) return;
    writeAutoSave("flags", examId, flags);
  }, [examId, flags, reviewMode]);
  useEffect(() => {
    if (reviewMode) return;
    writeAutoSave("drafts", examId, drafts);
  }, [examId, drafts, reviewMode]);
  useEffect(() => {
    if (reviewMode) return;
    writeAutoSave("notes", examId, notes);
  }, [examId, notes, reviewMode]);
  useEffect(() => {
    if (reviewMode) return;
    writeAutoSave("speaking", examId, {
      answered: speakingAnswered,
      transcript: speakingTranscript,
    });
  }, [examId, speakingAnswered, speakingTranscript, reviewMode]);

  const detailQuery = useExamDetail(examId ?? 0);
  const detail = detailQuery.data;
  // Cài nguồn API ngay trong render (trước khi children render) — idempotent
  // (trùng examId → return sớm, gọi mỗi render cũng không tốn).
  // KHÔNG bọc useMemo: React Compiler loại bỏ useMemo không dùng kết quả →
  // side-effect sync sẽ bị bỏ qua và trang làm bài cứ nhận dữ liệu mock.
  syncIeltsApiSource(isApiMode ? examId : null, detail);
  // current.reading mặc định = 41 (mock full) — đề API splice Reading từ 1 →
  // clamp về dải id thực tế (không là header hiện "Câu 41 / 40" và prev/next
  // bị tắt vì currentIndex = -1).
  useEffect(() => {
    if (READING_PASSAGES.length === 0) return;
    const from = READING_PASSAGES[0].from;
    const to = READING_PASSAGES[READING_PASSAGES.length - 1].to;
    setCurrentState((prev) =>
      prev.reading >= from && prev.reading <= to ? prev : { ...prev, reading: from },
    );
  }, [isApiMode, examId, detail]);

  const apiExam: IeltsApiExam | null =
    isApiMode && detail
      ? {
          id: detail.id,
          title: detail.title,
          description: detail.description,
          durationMinutes: Math.max(1, Math.round((detail.durationSeconds ?? 9600) / 60)),
          sections: detail.sections ?? [],
        }
      : null;

  // ------------------------------------- Chế độ xem lại bài đã nộp (?review=1)
  // 1) Dừng mọi đồng hồ — xem lại không tính giờ.
  useEffect(() => {
    if (!reviewMode) return;
    setStarted((prev) =>
      Object.values(prev).some(Boolean)
        ? { listening: false, reading: false, writing: false, speaking: false }
        : prev,
    );
  }, [reviewMode]);

  // 2) Nạp bài làm ĐÃ NỘP của lượt thi gần nhất (không lấy bản nháp dở dang).
  useEffect(() => {
    if (!reviewMode) return;

    // a) Snapshot trong phiên (mock + cùng phiên API) — answers/flags/notes/scope dự phòng.
    const snap = loadSubmittedSnapshot();
    const snapOk = Boolean(
      snap && (!isApiMode || snap.examId == null || snap.examId === examId),
    );
    if (snap && snapOk) {
      setFlags((prev) => (Object.keys(prev).length > 0 ? prev : snap.flags));
      setDrafts((prev) => (Object.keys(prev).length > 0 ? prev : snap.drafts));
      setNotes((prev) =>
        Object.keys(prev).length > 0 || !snap.notes ? prev : snap.notes,
      );
      setAnswers((prev) => (Object.keys(prev).length > 0 ? prev : snap.answers));
      // Trạng thái ghi âm Speaking per-question (file audio mất sau F5 — chỉ
      // khôi phục cờ + transcript; bản ghi nghe lại được khi còn trong phiên).
      setSpeakingAnswered((prev) =>
        Object.keys(prev).length > 0 ? prev : snap.speakingAnswered ?? prev,
      );
      setSpeakingTranscriptState((prev) =>
        Object.keys(prev).length > 0 ? prev : snap.speakingTranscript ?? prev,
      );
      // Scope của lượt đã nộp — chỉ khôi phục khi URL KHÔNG chỉ định ?section=…
      (["listening", "reading", "writing", "speaking"] as IeltsModule[]).forEach((module) => {
        if (searchParams.get(SCOPE_PARAM[module]) !== null) return;
        const groups = snap.scope?.[module];
        if (groups && groups.length > 0) setScope(module, groups);
      });
    }

    // b) Mock: bài trong phiên còn đó; F5 → snapshot đã dựng lại ở trên.
    if (!isApiMode) return;
    if (examId === null || !detail) return;

    // c) API: bài NỘP từ máy chủ là nguồn chính thức.
    let cancelled = false;
    (async () => {
      try {
        const attempts = await examService.getAttempts(examId);
        const submitted = attempts.find((a) => a.status === "SUBMITTED");
        if (!submitted) {
          // Vào nhầm ?review=1 khi chưa từng nộp → quay về trang làm bài thật.
          if (!cancelled) {
            const params = new URLSearchParams(searchParams);
            params.delete("review");
            navigate(
              { pathname, search: params.toString() ? `?${params.toString()}` : "" },
              { replace: true },
            );
          }
          return;
        }
        const rows = await examService.getAnswers(submitted.id);
        const rebuilt = rebuildIeltsAnswersFromRows(rows);
        if (!rebuilt || cancelled) return;
        setAnswers(rebuilt.answers);
        setDrafts(rebuilt.drafts);
        setSpeakingAnswered(rebuilt.speakingAnswered);
        setSpeakingTranscriptState(rebuilt.speakingTranscript);
      } catch {
        /* lỗi mạng / chưa đăng nhập → giữ nguyên dữ liệu đang có */
      }
    })();
    return () => {
      cancelled = true;
    };
    // searchParams chỉ dùng khi fetch xong — không đưa vào deps để tránh lặp.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewMode, isApiMode, examId, detail]);

  // ----------------------------------------------- Vòng đời lượt thi (attempt)
  const [attemptId, setAttemptId] = useState<number | null>(() => readSessionAttempt(examId));
  const attemptPromiseRef = useRef<Promise<number> | null>(null);

  const startAttempt = useCallback((): Promise<number> => {
    if (examId === null) {
      return Promise.reject(new Error("Không có đề thi API để tạo lượt thi"));
    }
    if (attemptId !== null) return Promise.resolve(attemptId);
    if (!attemptPromiseRef.current) {
      attemptPromiseRef.current = examService
        .start(examId)
        .then((attempt) => {
          setAttemptId(attempt.id);
          writeSessionAttempt(examId, attempt.id);
          return attempt.id;
        })
        .catch((error) => {
          attemptPromiseRef.current = null;
          throw error;
        });
    }
    return attemptPromiseRef.current;
  }, [examId, attemptId]);

  const clearAttempt = useCallback(() => {
    attemptPromiseRef.current = null;
    setAttemptId(null);
    writeSessionAttempt(0, null);
  }, []);

  // Đổi đề giữa chừng (URL examId khác đi) → quẳng attempt/promise của đề cũ.
  useEffect(() => {
    attemptPromiseRef.current = null;
    setAttemptId(readSessionAttempt(examId));
  }, [examId]);

  /** Nộp bài: objective (letter→optionId / answerText) + essay + transcript Speaking. */
  const submitToServer = useCallback(async (): Promise<ExamAttempt | null> => {
    const source = getIeltsApiSource();
    if (examId === null || !source) return null;
    const payload: SubmitExamAnswerDto[] = [];

    for (const [id, entry] of source.objectiveBinding) {
      const value = answers[id];
      if (!value) continue;
      if (entry.kind === "choice") {
        const optionId = entry.optionIds?.[value];
        if (optionId !== undefined) {
          payload.push({ questionId: entry.questionId, selectedOptionId: optionId });
        }
      } else {
        payload.push({ questionId: entry.questionId, answerText: value });
      }
    }

    for (const [taskId, questionId] of source.writingBinding) {
      const text = (drafts[taskId] ?? "").trim();
      if (text) payload.push({ questionId, answerText: text });
    }

    // Transcript của TỪNG câu Speaking đã ghi âm (key UI p{part}q{n}) → answerText
    // câu máy chủ tương ứng — binding part → [id] theo đúng thứ tự câu.
    for (const [part, questionIds] of source.speakingBinding) {
      questionIds.forEach((questionId, index) => {
        const transcript = (speakingTranscript[speakingUiId(part, index)] ?? "").trim();
        if (transcript) payload.push({ questionId, answerText: transcript });
      });
    }

    const id = await startAttempt();
    const submitted = await examService.submit(id, { answers: payload });
    clearAttempt();
    return submitted;
  }, [answers, drafts, speakingTranscript, examId, startAttempt, clearAttempt]);

  // One shared tick — only modules that started count down.
  useEffect(() => {
    const ticking = Object.values(started).some(Boolean);
    if (!ticking) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = { ...prev };
        (Object.keys(next) as IeltsModule[]).forEach((key) => {
          if (started[key] && next[key] > 0) next[key] -= 1;
        });
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started]);

  // Reading zoom: scale the root font size (same accessibility affordance as TOEIC).
  useEffect(() => {
    const previous = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = `${Math.round(fontScale * 100)}%`;
    return () => {
      document.documentElement.style.fontSize = previous;
    };
  }, [fontScale]);

  const saveNow = useCallback(() => setSavedAt(Date.now()), []);

  const selectAnswer = useCallback(
    (questionId: number, value: string) => {
      if (reviewMode) return; // Xem lại bài đã nộp → không sửa được bài làm.
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      setSavedAt(Date.now());
    },
    [reviewMode],
  );

  const toggleFlag = useCallback(
    (questionId: number) => {
      if (reviewMode) return;
      setFlags((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
    },
    [reviewMode],
  );

  // Ghi chú là vở nháp cá nhân của học viên → vẫn ghi được khi xem lại.
  const setNote = useCallback((questionId: number, text: string) => {
    setNotes((prev) => ({ ...prev, [questionId]: text }));
    setSavedAt(Date.now());
  }, []);

  const setDraft = useCallback(
    (taskId: number, text: string) => {
      if (reviewMode) return;
      setDrafts((prev) => ({ ...prev, [taskId]: text }));
      setSavedAt(Date.now());
    },
    [reviewMode],
  );

  const setCurrent = useCallback((module: ObjectiveModule, questionId: number) => {
    setCurrentState((prev) => ({ ...prev, [module]: questionId }));
  }, []);

  // Empty / all-invalid → clears the scope (the whole module is in play).
  const setScope = useCallback((module: IeltsModule, groups: number[]) => {
    const clean = [...new Set(groups)]
      .filter((id) => Number.isInteger(id) && id > 0)
      .sort((a, b) => a - b);
    setScopeState((prev) => {
      const prevIds = prev[module];
      if (clean.length === 0) {
        if (!prevIds) return prev;
        const next = { ...prev };
        delete next[module];
        return next;
      }
      const unchanged =
        prevIds !== undefined &&
        prevIds.length === clean.length &&
        prevIds.every((id, index) => id === clean[index]);
      return unchanged ? prev : { ...prev, [module]: clean };
    });
  }, []);

  const setWritingTask = useCallback((taskId: number) => setWritingTaskState(taskId), []);

  const setSpeakingPart = useCallback((part: 1 | 2 | 3) => setSpeakingPartState(part), []);

  // The speaking countdown is per part — restart it whenever the part changes.
  useEffect(() => {
    setTimeLeft((t) => ({ ...t, speaking: speakingPartSeconds(speakingPart) }));
  }, [speakingPart]);

  const setSpeakingIndex = useCallback((part: number, index: number) => {
    setSpeakingIndexState((prev) => ({ ...prev, [part]: index }));
  }, []);

  const markSpeakingAnswered = useCallback((questionId: string) => {
    setSpeakingAnswered((prev) => (prev[questionId] ? prev : { ...prev, [questionId]: true }));
    setSavedAt(Date.now());
  }, []);

  const unmarkSpeakingAnswered = useCallback((questionId: string) => {
    setSpeakingAnswered((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setSavedAt(Date.now());
  }, []);

  const setSpeakingTranscript = useCallback((questionId: string, text: string) => {
    setSpeakingTranscriptState((prev) => ({ ...prev, [questionId]: text }));
    setSavedAt(Date.now());
  }, []);

  // Blob URL bản ghi theo CÂU — revoke URL cũ khi ghi đè / xoá (không rò rỉ
  // bộ nhớ); URL sống qua cả lúc nộp bài để result + review phát lại được.
  const setSpeakingAudio = useCallback((questionId: string, url: string | null) => {
    setSpeakingAudioState((prev) => {
      const old = prev[questionId];
      if (old && old !== url) URL.revokeObjectURL(old);
      if (url === null) {
        if (old === undefined) return prev;
        const next = { ...prev };
        delete next[questionId];
        return next;
      }
      if (old === url) return prev;
      return { ...prev, [questionId]: url };
    });
  }, []);

  const setSpeakingNotes = useCallback((text: string) => {
    setSpeakingNotesState(text);
    setSavedAt(Date.now());
  }, []);

  const startModule = useCallback(
    (module: IeltsModule) => {
      if (reviewMode) return; // Xem lại → không khởi động đồng hồ đếm ngược.
      setStarted((prev) => (prev[module] ? prev : { ...prev, [module]: true }));
    },
    [reviewMode],
  );

  const setFontScale = useCallback((scale: number) => {
    setFontScaleState(Math.min(1.3, Math.max(0.9, Math.round(scale * 100) / 100)));
  }, []);

  const submitExam = useCallback(() => {
    const spent = (Object.keys(started) as IeltsModule[]).reduce(
      (sum, key) => (started[key] ? sum + (INITIAL_TIME[key] - timeLeft[key]) : sum),
      0,
    );
    const computed = computeIeltsResult({
      answers,
      drafts,
      flags,
      speakingAnswered,
      timeSpentSec: Math.max(0, spent),
      speakingQuestionCount: speakingQuestionTotal(),
      speakingAnsweredCount: Object.keys(speakingAnswered).length,
    });
    setResult(computed);
    setSavedAt(Date.now());
    // Nộp xong → xoá bản auto-save để lượt thi mới bắt đầu sạch.
    clearAutoSave(examId);
    return computed;
  }, [answers, drafts, flags, speakingAnswered, started, timeLeft, examId]);

  // Chế độ API: chờ tải đề thật / báo lỗi trước khi render nội dung (không nháy mock).
  if (isApiMode && !detail) {
    if (detailQuery.isError) {
      return (
        <div className="grid min-h-screen place-items-center bg-muted/40 p-6">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <h1 className="text-lg font-extrabold text-foreground">Không tải được đề thi</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Không kết nối được máy chủ để tải đề. Hãy kiểm tra đăng nhập và kết nối mạng, rồi thử
              lại.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => detailQuery.refetch()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground transition-colors hover:opacity-90"
              >
                Thử lại
              </button>
              <Link
                to="/ielts"
                className="rounded-lg border border-border px-4 py-2 text-sm font-extrabold text-foreground transition-colors hover:bg-muted"
              >
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40">
        <p className="animate-pulse text-sm font-extrabold text-muted-foreground">
          Đang tải đề thi từ máy chủ…
        </p>
      </div>
    );
  }

  const value: IeltsExamContextValue = {
    answers,
    flags,
    notes,
    drafts,
    current,
    writingTask,
    speakingPart,
    speakingIndex,
    speakingAnswered,
    speakingTranscript,
    speakingAudio,
    speakingNotes,
    timeLeft,
    started,
    scope,
    fontScale,
    savedAt,
    result,
    selectAnswer,
    toggleFlag,
    setNote,
    setDraft,
    setCurrent,
    setScope,
    setWritingTask,
    setSpeakingPart,
    setSpeakingIndex,
    markSpeakingAnswered,
    unmarkSpeakingAnswered,
    setSpeakingTranscript,
    setSpeakingAudio,
    setSpeakingNotes,
    startModule,
    setFontScale,
    saveNow,
    submitExam,
    isApiMode,
    reviewMode,
    apiExam,
    startAttempt,
    submitToServer,
  };

  return <IeltsExamContext.Provider value={value}>{children}</IeltsExamContext.Provider>;
}
