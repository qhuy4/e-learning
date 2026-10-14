import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Send,
  AlertTriangle,
  BookOpen,
  Info,
  PanelLeft,
  PanelRight,
  Flag,
  StickyNote,
  ChevronDown,
} from "lucide-react";
import { useExamDetail, useExamAttempts, useSubmitExam } from "../hooks";
import {
  ExamAttemptStatus,
  ExamMaterialType,
  QuestionType,
  type SubmitExamAnswerDto,
  type ExamQuestion,
  type ExamSection,
  type ExamGroupMaterial,
  type ExamQuestionGroup,
} from "../types";
import {
  countWords,
  questionControlKind,
  shortenText,
  unsupportedQuestionMessage,
} from "../utils";

interface LocationState {
  examId: number;
  attemptId?: number;
  startedAt: string;
}

interface QuestionWithMeta {
  question: ExamQuestion;
  section: ExamSection;
  /** Mọi tài liệu của nhóm câu hỏi (âm bản / đoạn văn / hình ảnh)… */
  materials: ExamGroupMaterial[];
  group?: ExamQuestionGroup;
  globalIndex: number;
}

/* ------------------------------------------------------------------ */
/* Đánh dấu + ghi chú (localStorage theo lượt thi — không cần API)     */
/* ------------------------------------------------------------------ */

interface QuestionMark {
  flagged?: boolean;
  note?: string;
}
type MarkMap = Record<number, QuestionMark>;

const markStorageKey = (attemptId: number) => `exam-marks-${attemptId}`;

function loadMarks(attemptId?: number): MarkMap {
  if (attemptId == null || typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(markStorageKey(attemptId)) ?? "{}");
  } catch {
    return {};
  }
}

function CountdownTimer({
  durationSeconds,
  onTimeUp,
  startedAt,
}: {
  durationSeconds: number;
  onTimeUp: () => void;
  startedAt: string;
}) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
    return Math.max(0, durationSeconds - elapsed);
  });

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining, onTimeUp]);

  const total = Math.floor(remaining);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const isLow = remaining < 300;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-sm font-bold tabular-nums transition-colors sm:text-base ${
        isLow
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border bg-muted/50 text-foreground"
      }`}
      role="timer"
      aria-label="Thời gian còn lại"
    >
      <Clock className={`size-4 ${isLow ? "text-destructive" : "text-primary"}`} />
      <span>
        {hours > 0 && `${hours}:`}
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function MaterialDisplay({ material }: { material: ExamGroupMaterial }) {
  switch (material.type) {
    case ExamMaterialType.AUDIO:
      return (
        <div className="mb-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
          {material.title && (
            <p className="mb-2 text-sm font-bold text-primary">{material.title}</p>
          )}
          <audio controls className="w-full">
            <source src={material.fileUrl ?? undefined} />
            Trình duyệt của bạn không hỗ trợ audio.
          </audio>
          {material.transcript && (
            <details className="mt-2">
              <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-bold text-primary hover:opacity-80">
                <ChevronDown className="size-3.5" />
                Xem transcript
              </summary>
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-card/80 p-3 text-sm leading-relaxed text-foreground">
                {material.transcript}
              </p>
            </details>
          )}
        </div>
      );
    case ExamMaterialType.IMAGE:
      return (
        <div className="mb-4 rounded-2xl border border-border bg-card p-4">
          {material.title && (
            <p className="mb-2 text-sm font-bold text-foreground">{material.title}</p>
          )}
          <img
            src={material.fileUrl ?? ""}
            alt={material.title ?? "Exam material"}
            className="max-w-full rounded-xl border border-border"
          />
          {material.content && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {material.content}
            </p>
          )}
        </div>
      );
    case ExamMaterialType.PASSAGE:
    case ExamMaterialType.TEXT:
    default:
      return (
        <div className="mb-4 rounded-2xl border border-border bg-card p-4">
          {material.title && (
            <p className="mb-2 text-sm font-extrabold text-foreground">{material.title}</p>
          )}
          <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
            {material.content}
          </div>
        </div>
      );
  }
}

export function ExamTakingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const examId = state?.examId ?? (id ? Number(id) : undefined);
  const startedAt = state?.startedAt ?? new Date().toISOString();

  const { data: exam, isLoading: examLoading } = useExamDetail(examId ?? 0);
  const { data: attempts, isLoading: attemptsLoading } = useExamAttempts(examId ?? 0);
  const submitExam = useSubmitExam();

  // The attempt id arrives in the location state (start from the detail page);
  // deep links fall back to the candidate's in-progress attempt for this exam.
  const inProgressAttempt = attempts?.find(
    (a) => a.status === ExamAttemptStatus.IN_PROGRESS
  );
  const attemptId = state?.attemptId ?? inProgressAttempt?.id;

  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  // Đáp án cho câu MULTI_SELECT (nhiều lựa chọn) và câu trả lời văn bản.
  const [multiAnswers, setMultiAnswers] = useState<Map<number, number[]>>(new Map());
  const [textAnswers, setTextAnswers] = useState<Map<number, string>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hai cột phụ — bật/tắt từ header, ghi nhớ lựa chọn.
  const [leftOpen, setLeftOpen] = useState(
    () => typeof window === "undefined" || localStorage.getItem("exam-panel-left") !== "0"
  );
  const [rightOpen, setRightOpen] = useState(
    () => typeof window === "undefined" || localStorage.getItem("exam-panel-right") !== "0"
  );
  const toggleLeft = () =>
    setLeftOpen((v) => {
      try {
        localStorage.setItem("exam-panel-left", v ? "0" : "1");
      } catch { /* localStorage blocked — bỏ qua */ }
      return !v;
    });
  const toggleRight = () =>
    setRightOpen((v) => {
      try {
        localStorage.setItem("exam-panel-right", v ? "0" : "1");
      } catch { /* localStorage blocked — bỏ qua */ }
      return !v;
    });

  // Đánh dấu / ghi chú của LƯỢT THI hiện tại (mở lại trang vẫn còn).
  const [marks, setMarks] = useState<MarkMap>({});
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  useEffect(() => {
    setMarks(loadMarks(attemptId));
    setShowNoteEditor(false);
  }, [attemptId]);

  const allQuestions: QuestionWithMeta[] = useMemo(() => {
    if (!exam?.sections) return [];
    let globalIndex = 0;
    const questions: QuestionWithMeta[] = [];

    for (const section of exam.sections) {
      const sectionWithDetails = section as ExamSection & {
        questions?: ExamQuestion[];
        groups?: (ExamQuestionGroup & { materials?: ExamGroupMaterial[]; questions?: ExamQuestion[] })[];
      };

      const directQs = sectionWithDetails.questions ?? [];
      for (const question of directQs) {
        questions.push({
          question,
          section,
          materials: [],
          group: undefined,
          globalIndex: globalIndex++,
        });
      }

      const groups = sectionWithDetails.groups ?? [];
      for (const group of groups) {
        const groupMaterials = group.materials ?? [];
        const groupQs = group.questions ?? [];
        for (const question of groupQs) {
          questions.push({
            question,
            section,
            materials: groupMaterials,
            group,
            globalIndex: globalIndex++,
          });
        }
      }
    }
    return questions;
  }, [exam]);

  const totalQuestions = allQuestions.length;

  /** questionId → index trong danh sách (dùng cho panel ghi chú nhảy câu). */
  const indexByQuestionId = useMemo(() => {
    const map = new Map<number, number>();
    allQuestions.forEach((q, idx) => map.set(q.question.id, idx));
    return map;
  }, [allQuestions]);

  // Chỉ câu có điều khiển trả lời mới tính vào tiến độ / đếm đã trả lời
  // (dạng chưa được hỗ trợ như MATCHING hiển thị hộp thông báo, bỏ qua).
  const answerableQuestions = useMemo(
    () => allQuestions.filter((q) => questionControlKind(q.question) !== "UNSUPPORTED"),
    [allQuestions],
  );

  const isQuestionAnswered = (question: ExamQuestion): boolean => {
    switch (questionControlKind(question)) {
      case "TEXT":
        // Câu trả lời văn bản chỉ được coi là "đã trả lời" khi có nội dung.
        return (textAnswers.get(question.id) ?? "").trim().length > 0;
      case "MULTI":
        return (multiAnswers.get(question.id) ?? []).length > 0;
      case "SINGLE":
        return answers.has(question.id);
      default:
        return false;
    }
  };

  const answerableCount = answerableQuestions.length;
  const answeredCount = answerableQuestions.filter((q) =>
    isQuestionAnswered(q.question),
  ).length;

  const handleSubmit = async () => {
    if (isSubmitting || !attemptId) return;
    setIsSubmitting(true);
    try {
      const answerDtos: SubmitExamAnswerDto[] = [];
      for (const { question } of allQuestions) {
        switch (questionControlKind(question)) {
          case "TEXT": {
            // Trả lời văn bản → answerText; bỏ qua câu trống (chưa trả lời).
            const answerText = (textAnswers.get(question.id) ?? "").trim();
            if (answerText) {
              answerDtos.push({ questionId: question.id, answerText });
            }
            break;
          }
          case "MULTI": {
            // Server gộp nhiều entry cùng questionId thành một dòng đáp án.
            for (const selectedOptionId of multiAnswers.get(question.id) ?? []) {
              answerDtos.push({ questionId: question.id, selectedOptionId });
            }
            break;
          }
          case "SINGLE": {
            const selectedOptionId = answers.get(question.id);
            if (selectedOptionId != null) {
              answerDtos.push({ questionId: question.id, selectedOptionId });
            }
            break;
          }
          default:
            // Câu chưa được hỗ trợ — không gửi lên server.
            break;
        }
      }

      const graded = await submitExam.mutateAsync({
        attemptId: Number(attemptId),
        data: { answers: answerDtos },
      });

      toast.success("Nộp bài thành công!");
      navigate(`/exams/${examId}/result/${attemptId}`, {
        state: { examId, attempt: graded },
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi nộp bài thi");
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  // Không dùng useCallback: closure phải đọc được trạng thái mới nhất
  // (nộp tự động khi hết giờ vẫn giữ câu trả lời văn bản vừa nhập).
  const handleTimeUp = () => {
    toast.warning("Hết thời gian! Bài thi sẽ được nộp tự động.");
    void handleSubmit();
  };

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      if (next.get(questionId) === optionId) {
        next.delete(questionId);
      } else {
        next.set(questionId, optionId);
      }
      return next;
    });
  };

  const handleToggleOption = (questionId: number, optionId: number) => {
    setMultiAnswers((prev) => {
      const next = new Map(prev);
      const current = next.get(questionId) ?? [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      if (updated.length === 0) {
        next.delete(questionId);
      } else {
        next.set(questionId, updated);
      }
      return next;
    });
  };

  const handleTextAnswerChange = (questionId: number, value: string) => {
    setTextAnswers((prev) => {
      const next = new Map(prev);
      if (value === "") {
        next.delete(questionId);
      } else {
        next.set(questionId, value);
      }
      return next;
    });
  };

  /** Gộp thay đổi vào mark của câu hiện tại; xoá entry nếu trống hoàn toàn. */
  const updateCurrentMark = (patch: QuestionMark) => {
    if (attemptId == null || !currentQuestion) return;
    const questionId = currentQuestion.question.id;
    setMarks((prev) => {
      const merged: QuestionMark = { ...prev[questionId], ...patch };
      const next: MarkMap = { ...prev };
      if (!merged.flagged && !((merged.note ?? "").trim())) {
        delete next[questionId];
      } else {
        next[questionId] = merged;
      }
      try {
        localStorage.setItem(markStorageKey(attemptId), JSON.stringify(next));
      } catch { /* localStorage blocked — bỏ qua */ }
      return next;
    });
  };

  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentMark: QuestionMark = currentQuestion
    ? (marks[currentQuestion.question.id] ?? {})
    : {};
  const currentNote = currentMark.note ?? "";

  const markedEntries = Object.entries(marks);
  const flaggedCount = markedEntries.filter(([, m]) => m.flagged).length;
  const notedCount = markedEntries.filter(([, m]) => (m.note ?? "").trim()).length;
  const progressPercent =
    answerableCount > 0 ? (answeredCount / answerableCount) * 100 : 0;

  if (!examId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-primary" />
          <p className="mt-4 font-semibold text-foreground">Thiếu thông tin bài thi</p>
          <button
            onClick={() => navigate("/exams")}
            className="mt-4 text-primary hover:underline"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (examLoading || attemptsLoading || !exam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="w-full max-w-4xl animate-pulse space-y-4">
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!attemptId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="max-w-md px-4 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-primary" />
          <p className="mt-4 font-semibold text-foreground">Chưa tìm thấy lượt thi nào cho đề này</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Hãy bấm “Bắt đầu làm bài” ở trang đề để hệ thống tạo lượt thi trước khi vào bài.
          </p>
          <button
            onClick={() => navigate(`/exams/${examId}`)}
            className="mt-4 text-primary hover:underline"
          >
            Quay lại trang đề
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">Không có câu hỏi nào</p>
          <button
            onClick={() => navigate("/exams")}
            className="mt-4 text-primary hover:underline"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const selectedOption = answers.get(currentQuestion.question.id);

  const currentQuestionId = currentQuestion.question.id;
  const controlKind = questionControlKind(currentQuestion.question);
  const currentQuestionType = currentQuestion.question.type;
  const selectedMultiOptions = multiAnswers.get(currentQuestionId) ?? [];
  const textAnswer = textAnswers.get(currentQuestionId) ?? "";
  const isEssay = currentQuestionType === QuestionType.ESSAY;
  const isAudioRecord = currentQuestionType === QuestionType.AUDIO_RECORD;
  const textInputId = `text-answer-${currentQuestionId}`;

  // Danh sách câu trả lời văn bản — hiển thị ở hộp xác nhận nộp bài.
  const textAnswerSummaries = allQuestions
    .filter((q) => questionControlKind(q.question) === "TEXT")
    .map((q) => ({
      number: q.globalIndex + 1,
      answer: (textAnswers.get(q.question.id) ?? "").trim(),
    }));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/40 text-foreground">
      {/* ---------------- Header — luôn dính trên, không trôi khi cuộn ---------------- */}
      <header className="z-30 shrink-0 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
          <button
            type="button"
            onClick={() => navigate(`/exams/${examId}`)}
            aria-label="Quay lại trang đề"
            title="Quay lại trang đề"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={toggleLeft}
            data-panel-toggle="left"
            aria-label={leftOpen ? "Ẩn cột trái" : "Hiện cột trái"}
            title={leftOpen ? "Ẩn cột trái" : "Hiện cột trái"}
            className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors lg:inline-flex ${
              leftOpen
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <PanelLeft className="size-4" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-extrabold sm:text-base">
              {exam.title}
            </h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {currentQuestion.section.name} · Câu {currentQuestionIndex + 1}/{totalQuestions}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleLeft}
            data-progress-toggle="header"
            aria-label={leftOpen ? "Ẩn cột tiến độ" : "Hiện cột tiến độ"}
            title={leftOpen ? "Ẩn cột tiến độ" : "Hiện cột tiến độ"}
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary md:inline-flex"
          >
            Đã trả lời {answeredCount}/{answerableCount}
          </button>

          {exam.durationSeconds != null && (
            <CountdownTimer
              durationSeconds={exam.durationSeconds}
              onTimeUp={handleTimeUp}
              startedAt={startedAt}
            />
          )}

          <button
            type="button"
            onClick={toggleRight}
            data-panel-toggle="right"
            aria-label={rightOpen ? "Ẩn cột phải" : "Hiện cột phải"}
            title={rightOpen ? "Ẩn cột phải" : "Hiện cột phải"}
            className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors xl:inline-flex ${
              rightOpen
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <PanelRight className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmSubmit(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:translate-y-px"
          >
            <Send className="size-4" />
            Nộp bài
          </button>
        </div>
        {/* Thanh tiến độ mảnh dưới header */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ---------------- Cột trái: tiến độ + chuyển câu hỏi (cố định) ---------------- */}
        {leftOpen && (
          <aside
            data-panel="left"
            className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-background lg:flex"
          >
            <div className="space-y-5 p-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Tiến độ
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {answeredCount}/{answerableCount} câu đã trả lời
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Chuyển câu hỏi
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {allQuestions.map((q, idx) => {
                    const isAnswered = isQuestionAnswered(q.question);
                    const isCurrent = idx === currentQuestionIndex;
                    const mark = marks[q.question.id];
                    return (
                      <button
                        key={q.question.id}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        aria-label={`Câu ${idx + 1}`}
                        className={`relative h-9 w-full rounded-lg text-xs font-bold transition-colors ${
                          isCurrent
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/40"
                            : isAnswered
                              ? "bg-primary/15 text-primary hover:bg-primary/25"
                              : "bg-muted text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        {idx + 1}
                        {mark?.flagged && (
                          <Flag className="absolute right-0.5 top-0.5 size-2.5 fill-current" />
                        )}
                        {!mark?.flagged && (mark?.note ?? "").trim() && (
                          <StickyNote className="absolute right-0.5 top-0.5 size-2.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-primary" />
                  <span>Câu hiện tại</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-primary/25" />
                  <span>Đã trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-muted" />
                  <span>Chưa trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="size-3 fill-primary text-primary" />
                  <span>Đã đánh dấu / ghi chú</span>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ---------------- Cột giữa: nội dung — chỉ phần này cuộn ---------------- */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
                Phần: {currentQuestion.section.name}
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
                Câu {currentQuestionIndex + 1}/{totalQuestions}
              </span>
              <span className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateCurrentMark({ flagged: !currentMark.flagged })}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                    currentMark.flagged
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  <Flag className={`size-3.5 ${currentMark.flagged ? "fill-current" : ""}`} />
                  {currentMark.flagged ? "Đã đánh dấu" : "Đánh dấu"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoteEditor((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                    showNoteEditor || currentNote.trim()
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  <StickyNote className="size-3.5" />
                  Ghi chú
                </button>
              </span>
            </div>

            {currentQuestion.group?.title && (
              <p className="mb-2 text-sm font-extrabold text-foreground">
                {currentQuestion.group.title}
              </p>
            )}
            {currentQuestion.group?.instructions && (
              <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {currentQuestion.group.instructions}
              </p>
            )}
            {currentQuestion.materials.map((material) => (
              <MaterialDisplay key={material.id} material={material} />
            ))}

            <div className="mb-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">
                  {currentQuestionIndex + 1}
                </span>
                <p className="whitespace-pre-wrap font-semibold leading-relaxed text-foreground">
                  {currentQuestion.question.question}
                </p>
              </div>
            </div>

            {controlKind === "TEXT" && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor={textInputId}
                    className="text-sm font-bold text-foreground"
                  >
                    {isAudioRecord
                      ? "Trả lời bằng văn bản (demo mô phỏng — không ghi âm thật)"
                      : currentQuestionType === QuestionType.FILL_BLANK
                        ? "Điền câu trả lời vào chỗ trống"
                        : "Câu trả lời tự luận"}
                  </label>
                  {isEssay && (
                    <span className="tabular-nums rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                      {countWords(textAnswer)} từ
                    </span>
                  )}
                </div>
                {isEssay || isAudioRecord ? (
                  <textarea
                    id={textInputId}
                    value={textAnswer}
                    onChange={(event) =>
                      handleTextAnswerChange(currentQuestionId, event.target.value)
                    }
                    rows={8}
                    placeholder={
                      isEssay
                        ? "Soạn thảo câu trả lời của bạn tại đây…"
                        : "Nhập câu trả lời của bạn tại đây…"
                    }
                    className="min-h-40 w-full resize-y rounded-xl border-2 border-border bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm outline-none transition-colors focus:border-primary"
                  />
                ) : (
                  <input
                    id={textInputId}
                    type="text"
                    value={textAnswer}
                    onChange={(event) =>
                      handleTextAnswerChange(currentQuestionId, event.target.value)
                    }
                    placeholder="Nhập câu trả lời của bạn tại đây…"
                    className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-primary"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Câu trả lời được lưu cùng bài làm và không được chấm điểm tự động.
                </p>
              </div>
            )}

            {controlKind === "MULTI" && (
              <div className="space-y-3">
                {(currentQuestion.question.options ?? [])
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((option) => {
                    const isChecked = selectedMultiOptions.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                          isChecked
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleToggleOption(currentQuestionId, option.id)
                          }
                          className="mt-1 size-4 accent-[#F38181]"
                        />
                        <span
                          className={`text-sm leading-relaxed ${
                            isChecked ? "font-semibold text-primary" : "text-foreground/90"
                          }`}
                        >
                          {option.content}
                        </span>
                      </label>
                    );
                  })}
                <p className="text-xs text-muted-foreground">
                  Câu này có thể có nhiều đáp án đúng — hãy chọn tất cả phương án phù hợp.
                </p>
              </div>
            )}

            {controlKind === "SINGLE" && (
              <div className="space-y-3">
                {(currentQuestion.question.options ?? [])
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((option) => {
                    const isSelected = selectedOption === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionId}`}
                          checked={isSelected}
                          onChange={() =>
                            handleSelectOption(currentQuestionId, option.id)
                          }
                          className="mt-1 size-4 accent-[#F38181]"
                        />
                        <span
                          className={`text-sm leading-relaxed ${
                            isSelected ? "font-semibold text-primary" : "text-foreground/90"
                          }`}
                        >
                          {option.content}
                        </span>
                      </label>
                    );
                  })}
              </div>
            )}

            {controlKind === "UNSUPPORTED" && (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
                <Info className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {unsupportedQuestionMessage(currentQuestionType)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  Bạn có thể chuyển sang câu khác để tiếp tục làm bài.
                </p>
              </div>
            )}

            {/* ---------------- Ghi chú của câu hiện tại ---------------- */}
            {showNoteEditor && (
              <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <label
                  htmlFor="note-input"
                  className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary"
                >
                  <StickyNote className="size-3.5" />
                  Ghi chú cho câu {currentQuestionIndex + 1}
                </label>
                <textarea
                  id="note-input"
                  value={currentNote}
                  onChange={(event) => updateCurrentMark({ note: event.target.value })}
                  rows={3}
                  placeholder="Viết ghi chú / mẹo cho câu này… (tự lưu khi gõ)"
                  className="mt-2 w-full resize-y rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Ghi chú lưu ngay trong máy cho tới khi bạn nộp bài.
                </p>
              </div>
            )}

            <div className="h-2" />
          </div>
        </main>

        {/* ---------------- Cột phải: đánh dấu & ghi chú (cố định) ---------------- */}
        {rightOpen && (
          <aside
            data-panel="right"
            className="hidden w-64 shrink-0 flex-col overflow-y-auto border-l border-border bg-background xl:flex"
          >
            <div className="border-b border-border p-4 pb-3">
              <h3 className="text-sm font-extrabold text-foreground">
                Đánh dấu &amp; Ghi chú
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {flaggedCount} đánh dấu · {notedCount} ghi chú
              </p>
            </div>
            <div className="space-y-2 p-3">
              {markedEntries.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-xs leading-relaxed text-muted-foreground">
                  Chưa có câu nào được đánh dấu hay ghi chú.
                  <br />
                  Dùng nút “Đánh dấu” / “Ghi chú” ở trên từng câu.
                </div>
              )}
              {markedEntries.map(([qid, mark]) => {
                const idx = indexByQuestionId.get(Number(qid));
                if (idx === undefined) return null;
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={qid}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      isCurrent
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-extrabold text-primary">
                      {mark.flagged && <Flag className="size-3 fill-current" />}
                      {!mark.flagged && <StickyNote className="size-3" />}
                      Câu {idx + 1}
                      {allQuestions[idx]?.section.name && (
                        <span className="ml-auto truncate text-[10px] font-bold text-muted-foreground">
                          {allQuestions[idx].section.name}
                        </span>
                      )}
                    </span>
                    {(mark.note ?? "").trim() && (
                      <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                        {mark.note}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* ---------------- Footer cố định: tiến độ + Câu trước/sau (không trôi) ---------------- */}
      <footer className="z-20 shrink-0 border-t border-border bg-background">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <button
            type="button"
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={isFirstQuestion}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Câu trước
          </button>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleLeft}
              data-progress-toggle="footer"
              aria-label={leftOpen ? "Ẩn cột tiến độ" : "Hiện cột tiến độ"}
              title={leftOpen ? "Ẩn cột tiến độ" : "Hiện cột tiến độ"}
              className="hidden items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary sm:inline-flex"
            >
              <span className="block h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </span>
              {answeredCount}/{answerableCount} câu
            </button>
            <span className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-bold tabular-nums text-muted-foreground sm:text-sm">
              Câu {currentQuestionIndex + 1}/{totalQuestions}
            </span>
            <span className="hidden truncate text-xs font-semibold text-muted-foreground lg:inline">
              {currentQuestion.section.name}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setCurrentQuestionIndex((prev) =>
                Math.min(totalQuestions - 1, prev + 1),
              )
            }
            disabled={isLastQuestion}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Câu tiếp
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>

      {/* ---------------- Xác nhận nộp bài ---------------- */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-extrabold text-foreground">Xác nhận nộp bài?</h3>
            <p className="mt-2 text-muted-foreground">
              Bạn đã trả lời{" "}
              <span className="font-extrabold text-foreground">{answeredCount}</span>/
              {answerableCount} câu hỏi.
              {answeredCount < answerableCount && (
                <span className="mt-1 block text-destructive">
                  Còn {answerableCount - answeredCount} câu chưa trả lời.
                </span>
              )}
            </p>
            {textAnswerSummaries.length > 0 && (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Câu trả lời văn bản
                </p>
                <ul className="max-h-40 space-y-1.5 overflow-y-auto text-sm">
                  {textAnswerSummaries.map((summary) => (
                    <li key={summary.number}>
                      <span className="font-bold text-foreground">Câu {summary.number}:</span>{" "}
                      {summary.answer ? (
                        <span className="whitespace-pre-wrap text-muted-foreground">
                          {shortenText(summary.answer)}
                        </span>
                      ) : (
                        <span className="text-primary">Chưa trả lời</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="rounded-xl bg-muted px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted/70"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? "Đang nộp..." : "Nộp bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
