import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useExamDetail } from "../../exams/hooks";
import { examService } from "../../exams/services/exam.service";
import type { ExamAttempt, ExamSection, SubmitExamAnswerDto } from "../../exams/types";
import {
  DEFAULT_MODE_MINUTES,
  DEFAULT_TOEIC_CONFIG,
  SPEAKING_TASK_COUNT,
  modeOfPath,
} from "../constants";
import { getToeicApiSource, syncToeicApiSource } from "../data/source";
import type { ToeicExamConfig, ToeicMode, ToeicResult, ToeicSection } from "../types";
import {
  clearAutoSave,
  computeToeicResult,
  loadSubmittedSnapshot,
  readAutoSave,
  rebuildAnswersFromRows,
  writeAutoSave,
} from "../utils";

/** Thông tin đề thật (API) đang mở — null khi làm mock. */
export interface ToeicApiExam {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  /** Section thật của đề — suy mode (lr/writing/speaking) cho landing + hướng dẫn. */
  sections: ExamSection[];
}

/** Giữ examId giữa các trang (instructions → run → review → result). */
const EXAM_ID_KEY = "toeic:api-exam-id";
/** AttemptId đang dở dang — xóa sau khi nộp bài thành công. */
const ATTEMPT_KEY = "toeic:attempt-id";

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

interface ToeicExamContextValue {
  answers: Record<number, string>;
  flags: Record<number, boolean>;
  notes: Record<number, string>;
  drafts: Record<number, string>;
  /** Speaking tasks already recorded (real mic recording, in-session audio). */
  speaking: Record<number, boolean>;
  /** Blob URL bản ghi âm theo task — chỉ sống trong phiên (F5 mất file). */
  speakingAudio: Record<number, string | undefined>;
  /** Setup chosen on the instructions page: mode, parts, duration. */
  config: ToeicExamConfig;
  /** Currently selected question number per section. */
  current: Record<ToeicSection, number>;
  writingTask: number;
  speakingTask: number;
  /** Countdown per mode — Listening & Reading share one clock. */
  timeLeft: Record<ToeicMode, number>;
  started: Record<ToeicMode, boolean>;
  fontScale: number;
  savedAt: number | null;
  result: ToeicResult | null;
  selectAnswer: (questionId: number, letter: string) => void;
  toggleFlag: (questionId: number) => void;
  setNote: (questionId: number, text: string) => void;
  setDraft: (taskId: number, text: string) => void;
  setConfig: (patch: Partial<ToeicExamConfig>) => void;
  setCurrent: (section: ToeicSection, questionId: number) => void;
  setWritingTask: (taskId: number) => void;
  setSpeakingTask: (taskId: number) => void;
  recordSpeaking: (taskId: number) => void;
  clearSpeaking: (taskId: number) => void;
  /** Gán (url) / xoá (null) bản ghi của task — revoke URL cũ khi thay thế. */
  setSpeakingAudio: (taskId: number, url: string | null) => void;
  startFlow: (mode: ToeicMode) => void;
  setFontScale: (scale: number) => void;
  saveNow: () => void;
  submitExam: () => ToeicResult;
  /** Đang nối API (có ?examId) thay vì dữ liệu mock. */
  isApiMode: boolean;
  /**
   * Chế độ XEM LẠI bài đã nộp (`?review=1` trên route làm bài) — tái sử dụng
   * chính trang đề thi: chỉ đọc, không chọn đáp án, không tính giờ, audio nghe
   * lại được và đáp án hiện dưới mỗi câu.
   */
  reviewMode: boolean;
  /** Đề thật từ API — null ở mock mode. */
  apiExam: ToeicApiExam | null;
  /** Tạo lượt thi trên máy chủ (idempotent, dedupe theo promise). */
  startAttempt: () => Promise<number>;
  /** Nộp bài lên API (trả lời trắc nghiệm → selectedOptionId). No-op khi mock. */
  submitToServer: () => Promise<ExamAttempt | null>;
}

const ToeicExamContext = createContext<ToeicExamContextValue | null>(null);

export function useToeicExam(): ToeicExamContextValue {
  const ctx = useContext(ToeicExamContext);
  if (!ctx) throw new Error("useToeicExam must be used within <ToeicExamProvider>");
  return ctx;
}

const INITIAL_TIME: Record<ToeicMode, number> = {
  lr: DEFAULT_MODE_MINUTES.lr * 60,
  writing: DEFAULT_MODE_MINUTES.writing * 60,
  speaking: DEFAULT_MODE_MINUTES.speaking * 60,
};

/**
 * Holds all mock exam state: answers, flags, notes, drafts, speaking records,
 * timers, setup config and font accessibility scale. UI-only (no persistence).
 */
export function ToeicExamProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [speaking, setSpeaking] = useState<Record<number, boolean>>({});
  const [speakingAudio, setSpeakingAudioState] = useState<Record<number, string | undefined>>({});
  const [config, setConfigState] = useState<ToeicExamConfig>(DEFAULT_TOEIC_CONFIG);
  const [current, setCurrentState] = useState<Record<ToeicSection, number>>({
    listening: 1,
    reading: 101,
    writing: 1,
    speaking: 1,
  });
  const [writingTask, setWritingTaskState] = useState(1);
  const [speakingTask, setSpeakingTaskState] = useState(1);
  const [started, setStarted] = useState<Record<ToeicMode, boolean>>({
    lr: false,
    writing: false,
    speaking: false,
  });
  const [timeLeft, setTimeLeft] = useState<Record<ToeicMode, number>>(INITIAL_TIME);
  const [fontScale, setFontScaleState] = useState(1);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [result, setResult] = useState<ToeicResult | null>(null);

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

  const detailQuery = useExamDetail(examId ?? 0);
  const detail = detailQuery.data;
  // Cài nguồn API ngay trong render (trước khi children render) — idempotent
  // (trùng examId → return sớm, gọi mỗi render cũng không tốn).
  // KHÔNG bọc useMemo: React Compiler loại bỏ useMemo không dùng kết quả →
  // side-effect sync sẽ bị bỏ qua và trang làm bài cứ nhận dữ liệu mock.
  syncToeicApiSource(isApiMode ? examId : null, detail);

  const apiExam: ToeicApiExam | null =
    isApiMode && detail
      ? {
          id: detail.id,
          title: detail.title,
          description: detail.description,
          durationMinutes: Math.max(1, Math.round((detail.durationSeconds ?? 7200) / 60)),
          sections: detail.sections ?? [],
        }
      : null;

  // Đề API KHÔNG có section Writing/Speaking → chặn URL vào trang đó (không
  // thì giữa đề thật lại vô tình chạy mock). Chờ detail để biết cấu trúc đề;
  // dùng effect (không return sớm) để số hook giữa các lần render không đổi.
  useEffect(() => {
    if (!isApiMode || !detail) return;
    const writingRoute = pathname.includes("/toeic/writing");
    const speakingRoute = pathname.includes("/toeic/speaking");
    if (!writingRoute && !speakingRoute) return;
    const sections = detail.sections ?? [];
    // Ưu tiên sectionType có cấu trúc; dữ liệu cũ chưa có cột → đoán tên.
    const has = (type: string, word: string) =>
      sections.some(
        (section) =>
          (section.sectionType ?? "").trim().toUpperCase() === type ||
          (section.name ?? "").toLowerCase().includes(word),
      );
    const allowed = writingRoute ? has("WRITING", "writing") : has("SPEAKING", "speaking");
    if (!allowed) navigate(`/toeic?examId=${examId}`, { replace: true });
  }, [isApiMode, detail, pathname, examId, navigate]);

  // ------------------------------------- Chế độ xem lại bài đã nộp (?review=1)
  // 1) Dừng mọi đồng hồ — xem lại không tính giờ.
  useEffect(() => {
    if (!reviewMode) return;
    setStarted((prev) =>
      prev.lr || prev.writing || prev.speaking
        ? { lr: false, writing: false, speaking: false }
        : prev,
    );
  }, [reviewMode]);

  // 2) Nạp bài làm ĐÃ NỘP của lượt thi gần nhất (không lấy bản nháp dở dang).
  useEffect(() => {
    if (!reviewMode) return;
    if (!isApiMode) {
      // Mock: bài trong phiên còn đó; F5 → dựng lại từ snapshot lúc nộp.
      setAnswers((prev) => {
        if (Object.keys(prev).length > 0) return prev;
        const snap = loadSubmittedSnapshot();
        return snap && Object.keys(snap.answers).length > 0 ? snap.answers : prev;
      });
      // Trạng thái ghi âm Speaking (file audio mất sau F5 — chỉ khôi phục cờ).
      setSpeaking((prev) => {
        if (Object.keys(prev).length > 0) return prev;
        const snap = loadSubmittedSnapshot();
        return snap && Object.keys(snap.speaking ?? {}).length > 0 ? snap.speaking ?? {} : prev;
      });
      return;
    }
    if (examId === null || !detail) return;
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
        const source = getToeicApiSource();
        if (!source || cancelled) return;
        const rebuilt = rebuildAnswersFromRows(source, rows);
        if (cancelled) return;
        setAnswers(rebuilt.answers);
        setDrafts(rebuilt.drafts);
        setSpeaking(rebuilt.speaking);
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

  /**
   * Nộp bài lên máy chủ:
   * 1) Câu trắc nghiệm L&R (letter → optionId),
   * 2) Writing — bài làm thật trong ô soạn thảo → answerText câu ESSAY,
   * 3) Speaking — task đã ghi âm (mic thật, blob trong phiên) → answerText câu AUDIO_RECORD.
   */
  const submitToServer = useCallback(async (): Promise<ExamAttempt | null> => {
    const source = getToeicApiSource();
    if (examId === null || !source) return null;
    const payload: SubmitExamAnswerDto[] = [];
    for (const [displayId, entry] of source.binding) {
      const letter = answers[displayId];
      if (!letter) continue;
      const optionId = entry.optionIds[letter];
      if (optionId !== undefined) {
        payload.push({ questionId: entry.questionId, selectedOptionId: optionId });
      }
    }
    for (const [taskId, questionId] of source.writingBinding) {
      const draft = (drafts[taskId] ?? "").trim();
      if (draft) payload.push({ questionId, answerText: draft });
    }
    for (const [taskId, questionId] of source.speakingBinding) {
      if (speaking[taskId]) {
        payload.push({
          questionId,
          answerText: "Đã hoàn thành task nói (ghi âm bằng mic trình duyệt trên giao diện CBT).",
        });
      }
    }
    const id = await startAttempt();
    const submitted = await examService.submit(id, { answers: payload });
    clearAttempt();
    return submitted;
  }, [answers, drafts, speaking, examId, startAttempt, clearAttempt]);

  // Setup changed → sync the chosen duration and allow a fresh start for that mode.
  useEffect(() => {
    setTimeLeft((prev) => ({ ...prev, [config.mode]: config.minutes * 60 }));
    setStarted((prev) => (prev[config.mode] ? { ...prev, [config.mode]: false } : prev));
  }, [config]);

  // One shared tick — only flows that started count down.
  useEffect(() => {
    const ticking = Object.values(started).some(Boolean);
    if (!ticking) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = { ...prev };
        (Object.keys(next) as ToeicMode[]).forEach((key) => {
          if (started[key] && next[key] > 0) next[key] -= 1;
        });
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started]);

  // Accessibility: zoom the whole exam UI by scaling the root font size.
  useEffect(() => {
    const previous = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = `${Math.round(fontScale * 100)}%`;
    return () => {
      document.documentElement.style.fontSize = previous;
    };
  }, [fontScale]);

  const saveNow = useCallback(() => setSavedAt(Date.now()), []);

  const selectAnswer = useCallback(
    (questionId: number, letter: string) => {
      if (reviewMode) return; // Xem lại bài đã nộp → không sửa được bài làm.
      setAnswers((prev) => ({ ...prev, [questionId]: letter }));
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

  const setNote = useCallback((questionId: number, text: string) => {
    setNotes((prev) => ({ ...prev, [questionId]: text }));
    setSavedAt(Date.now());
  }, []);

  const setDraft = useCallback((taskId: number, text: string) => {
    setDrafts((prev) => ({ ...prev, [taskId]: text }));
    setSavedAt(Date.now());
  }, []);

  const setConfig = useCallback((patch: Partial<ToeicExamConfig>) => {
    setConfigState((prev) => {
      const next: ToeicExamConfig = { ...prev, ...patch };
      // Switching mode without an explicit duration falls back to that mode's default.
      if (patch.mode && patch.mode !== prev.mode && patch.minutes === undefined) {
        next.minutes = DEFAULT_MODE_MINUTES[patch.mode];
      }
      return next;
    });
  }, []);

  // Làm đề API nhảy THẲNG vào trang bài (landing "Tiếp tục lần thi" không qua
  // trang hướng dẫn) → đồng bộ config.mode với route đang mở, nếu không review/
  // result sẽ hiển thị nhầm mode (viết bài nhưng review hiện phần L&R).
  useEffect(() => {
    if (!isApiMode) return;
    const onRunRoute =
      pathname.includes("/toeic/run") ||
      pathname.includes("/toeic/writing") ||
      pathname.includes("/toeic/speaking");
    if (!onRunRoute) return; // trang hướng dẫn tự chọn mode qua ?mode=
    const routeMode = modeOfPath(pathname);
    if (routeMode === config.mode) return;
    setConfig({ mode: routeMode, parts: [], tasks: [] });
  }, [isApiMode, pathname, config.mode, setConfig]);

  const setCurrent = useCallback((section: ToeicSection, questionId: number) => {
    setCurrentState((prev) => ({ ...prev, [section]: questionId }));
  }, []);

  const setWritingTask = useCallback((taskId: number) => setWritingTaskState(taskId), []);

  const setSpeakingTask = useCallback((taskId: number) => setSpeakingTaskState(taskId), []);

  const recordSpeaking = useCallback((taskId: number) => {
    if (taskId < 1 || taskId > SPEAKING_TASK_COUNT) return;
    setSpeaking((prev) => ({ ...prev, [taskId]: true }));
    setSavedAt(Date.now());
  }, []);

  const clearSpeaking = useCallback((taskId: number) => {
    setSpeaking((prev) => {
      if (!prev[taskId]) return prev;
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setSavedAt(Date.now());
  }, []);

  // Blob URL bản ghi theo task — revoke URL cũ khi ghi đè / xoá; URL sống qua
  // lúc nộp bài để trang chi tiết + trang Speaking (review) phát lại được.
  const setSpeakingAudio = useCallback((taskId: number, url: string | null) => {
    setSpeakingAudioState((prev) => {
      const old = prev[taskId];
      if (old && old !== url) URL.revokeObjectURL(old);
      if (url === null) {
        if (old === undefined) return prev;
        const next = { ...prev };
        delete next[taskId];
        return next;
      }
      if (old === url) return prev;
      return { ...prev, [taskId]: url };
    });
  }, []);

  const startFlow = useCallback(
    (mode: ToeicMode) => {
      if (reviewMode) return; // Xem lại → không khởi động đồng hồ đếm ngược.
      setStarted((prev) => (prev[mode] ? prev : { ...prev, [mode]: true }));
    },
    [reviewMode],
  );

  const setFontScale = useCallback((scale: number) => {
    setFontScaleState(Math.min(1.3, Math.max(0.9, Math.round(scale * 100) / 100)));
  }, []);

  const submitExam = useCallback(() => {
    const computed = computeToeicResult(answers, drafts, flags, {
      speaking,
      parts: config.parts,
      mode: config.mode,
      tasks: config.tasks,
    });
    setResult(computed);
    setSavedAt(Date.now());
    // Nộp xong → xoá bản auto-save để lượt thi mới bắt đầu sạch.
    clearAutoSave(examId);
    return computed;
  }, [answers, drafts, flags, speaking, config.parts, config.mode, config.tasks, examId]);

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
                to="/toeic"
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

  const value: ToeicExamContextValue = {
    answers,
    flags,
    notes,
    drafts,
    speaking,
    speakingAudio,
    config,
    current,
    writingTask,
    speakingTask,
    timeLeft,
    started,
    fontScale,
    savedAt,
    result,
    selectAnswer,
    toggleFlag,
    setNote,
    setDraft,
    setConfig,
    setCurrent,
    setWritingTask,
    setSpeakingTask,
    recordSpeaking,
    clearSpeaking,
    setSpeakingAudio,
    startFlow,
    setFontScale,
    saveNow,
    submitExam,
    isApiMode,
    reviewMode,
    apiExam,
    startAttempt,
    submitToServer,
  };

  return <ToeicExamContext.Provider value={value}>{children}</ToeicExamContext.Provider>;
}
