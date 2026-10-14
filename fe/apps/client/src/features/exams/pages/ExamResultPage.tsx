import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useExamDetail, useExamAttempts, useExamAnswers } from "../hooks";
import type { ExamAttempt } from "../types";
import { collectExamQuestions, isTextAnswerType } from "../utils";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
  Target,
  RotateCcw,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface LocationState {
  examId?: number;
  /** Graded attempt handed over by the taking page (fallback for the query). */
  attempt?: ExamAttempt;
}

/** "dd/mm/yyyy, HH:mm" — thời điểm nộp bài trên báo cáo. */
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function ExamResultPage() {
  const { examId: examIdParam, attemptId } = useParams<{
    examId: string;
    attemptId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const examId = Number(examIdParam ?? 0) || state?.examId;
  const id = Number(attemptId);

  const { data: exam, isLoading: examLoading } = useExamDetail(examId ?? 0);
  const { data: attempts, isLoading: attemptsLoading } = useExamAttempts(
    examId ?? 0
  );
  const { data: answers } = useExamAnswers(id);

  // Câu tự luận / trả lời mở: server không chấm điểm tự động nên tách thành
  // dòng riêng ("đã trả lời x/y"), không tham gia điểm % hay Đúng/Sai.
  // Câu text CÓ đáp án keyed (FILL_BLANK…) server vẫn chấm → không tính vào đây.
  const textStats = useMemo(() => {
    const textQuestions = collectExamQuestions(exam?.sections).filter(
      (question) =>
        isTextAnswerType(question.type) &&
        !(question.options ?? []).some((option) => option.isCorrect),
    );
    if (textQuestions.length === 0 || answers === undefined) return null;
    const answerByQuestion = new Map((answers ?? []).map((a) => [a.questionId, a]));
    const answered = textQuestions.filter((question) => {
      const answerText = answerByQuestion.get(question.id)?.answerText ?? "";
      return answerText.trim().length > 0;
    }).length;
    return { answered, total: textQuestions.length };
  }, [exam, answers]);

  // Prefer the attempts query; fall back to the graded attempt passed by the
  // taking page so the report still renders when that endpoint is unavailable.
  const attempt = attempts?.find((a) => a.id === id) ?? state?.attempt;
  const isLoading = examLoading || attemptsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="w-full max-w-md animate-pulse space-y-4">
          <div className="h-32 rounded-xl bg-muted" />
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Không tìm thấy kết quả
          </h3>
          <button
            onClick={() => navigate("/exams")}
            className="mt-4 font-semibold text-primary hover:underline"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // `score` is the 0–100 percentage graded by the API
  // (Math.round(correct / total * 100)); fall back to counting the raw values
  // when the API has not graded the attempt yet (score missing / 0).
  // server `score`/`correctCount`/`totalQuestions` only cover the questions
  // WITH options — câu tự luận không chấm điểm tự động (xem dòng riêng dưới đây).
  const score = attempt.score ?? 0;
  const correctCount = attempt.correctCount ?? 0;
  const totalQuestions = attempt.totalQuestions ?? 0;
  const percentage =
    score > 0
      ? Math.min(100, score)
      : totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;
  const isPassed = percentage >= 60;

  // Vòng progress SVG: chu vi vòng tròn + offset theo tỷ lệ.
  const RING_RADIUS = 52;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  return (
    <div className="min-h-screen bg-muted/40 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {/* Hero: điểm số trên nền coral nhẹ */}
          <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-background p-9 text-center sm:p-10">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-extrabold uppercase tracking-wider ${
                isPassed
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-primary/40 bg-primary/10 text-primary"
              }`}
            >
              {isPassed ? (
                <Trophy className="size-4" />
              ) : (
                <XCircle className="size-4" />
              )}
              {isPassed ? "Đạt" : "Chưa đạt"}
            </span>

            <div className="relative mx-auto mt-5 size-44 sm:size-48">
              <svg viewBox="0 0 120 120" className="size-44 -rotate-90 sm:size-48">
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="9"
                  className="stroke-muted"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - percentage / 100)}
                  className={isPassed ? "stroke-emerald-500" : "stroke-primary"}
                  style={{ transition: "stroke-dashoffset .6s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold leading-none text-foreground">
                  {score}
                </span>
                <span className="mt-1.5 text-sm font-bold text-muted-foreground">
                  điểm / 100
                </span>
              </div>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold text-foreground">
              {isPassed ? "Chúc mừng bạn đã đậu!" : "Bạn chưa đạt"}
            </h1>
            <p className="mt-1.5 text-base font-medium text-muted-foreground">
              {exam?.title}
            </p>
            {attempt.submittedAt && (
              <p className="mt-1 text-sm text-muted-foreground">
                Nộp bài lúc {formatDateTime(attempt.submittedAt)}
              </p>
            )}
          </div>

          <div className="p-7 sm:p-9">
            <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-border bg-muted/30 p-5 text-center sm:p-6">
                <span className="mx-auto mb-2.5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target className="size-5" />
                </span>
                <p className="text-4xl font-extrabold text-foreground">{score}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground sm:text-sm">
                  Điểm (0–100)
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-5 text-center sm:p-6">
                <span className="mx-auto mb-2.5 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </span>
                <p className="text-4xl font-extrabold text-foreground">
                  {correctCount}/{totalQuestions}
                </p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground sm:text-sm">
                  Câu đúng
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-5 text-center sm:p-6">
                <span className="mx-auto mb-2.5 flex size-11 items-center justify-center rounded-xl bg-piemind-mint/60 text-[#146a5f]">
                  <Clock className="size-5" />
                </span>
                <p className="text-4xl font-extrabold text-foreground">
                  {percentage}%
                </p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground sm:text-sm">
                  Tỷ lệ đúng
                </p>
              </div>
            </div>

            {textStats && (
              <div className="mb-6 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-3.5 text-sm font-bold text-primary sm:text-base">
                <span>Câu tự luận / trả lời mở</span>
                <span className="tabular-nums">
                  Đã trả lời {textStats.answered}/{textStats.total} câu
                </span>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to={`/exams/${examId}/review/${attemptId}`}
                state={{ examId }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-lg font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:translate-y-px"
              >
                <Eye className="h-5 w-5" />
                Xem lại đáp án
              </Link>
              <Link
                to={`/exams/${examId}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 font-bold text-foreground transition-colors hover:bg-muted"
              >
                <RotateCcw className="h-5 w-5" />
                Làm lại bài thi
              </Link>
              <Link
                to="/exams"
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Quay lại danh sách đề thi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
