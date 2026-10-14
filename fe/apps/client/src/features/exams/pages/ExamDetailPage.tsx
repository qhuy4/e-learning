import { useParams, useNavigate, Link } from "react-router-dom";
import { useExamDetail, useStartExam, useExamAttempts } from "../hooks";
import { useAuth } from "../../auth/hooks/use-auth";
import { ExamAttemptStatus } from "../types";
import { examTypeLabel, routeForExam } from "../utils";
import {
  Clock,
  FileText,
  AlertCircle,
  Loader2,
  Play,
  Layers,
  LayoutList,
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

/** "dd/mm/yyyy, HH:mm" cho lịch sử làm bài. */
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const examId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: exam, isLoading, isError } = useExamDetail(examId);
  const { data: attempts } = useExamAttempts(examId);
  const startExam = useStartExam();
  const [starting, setStarting] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  const hasToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken"));

  const inProgressAttempt = attempts?.find(
    (a) => a.status === ExamAttemptStatus.IN_PROGRESS && a.userId === user?.id
  );

  /** Route is /exams/:id/take — the attempt id travels in the location state. */
  const openAttempt = (attempt: { id: number; startedAt: string }) => {
    navigate(`/exams/${examId}/take`, {
      state: { examId, attemptId: attempt.id, startedAt: attempt.startedAt },
    });
  };

  const handleStart = async () => {
    // Đề TOEIC / IELTS mở module giao diện riêng — chưa tạo attempt API ở đây;
    // phase nối API sẽ start + nộp bài từ chính module (examId theo query).
    const type = (exam?.examTypeName ?? "").trim().toUpperCase();
    if (exam && (type === "TOEIC" || type === "IELTS")) {
      navigate(routeForExam(exam));
      return;
    }

    if (!hasToken) {
      setAuthRequired(true);
      toast.warning("Đăng nhập để bắt đầu thi và lưu kết quả");
      return;
    }

    if (inProgressAttempt) {
      openAttempt(inProgressAttempt);
      return;
    }

    setStarting(true);
    try {
      const attempt = await startExam.mutateAsync(examId);
      openAttempt(attempt);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setAuthRequired(true);
        toast.error("Đăng nhập để bắt đầu thi và lưu kết quả");
      } else {
        toast.error(
          err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            "Không thể bắt đầu bài thi",
        );
      }
    } finally {
      setStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-64 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Không tìm thấy đề thi
          </h3>
          <Link
            to="/exams"
            className="mt-4 inline-block font-semibold text-primary hover:underline"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const totalQuestions =
    exam.sections?.reduce((sum, s) => sum + (s.questionCount ?? 0), 0) ?? 0;
  const durationMinutes = Math.floor((exam.durationSeconds ?? 0) / 60);
  const totalMaterials =
    exam.sections?.reduce((sum, s) => {
      const sectionWithDetails = s as any;
      const groupMaterials = (sectionWithDetails.groups ?? []).reduce(
        (gSum: number, g: any) => gSum + (g.materials?.length ?? 0),
        0
      );
      return sum + groupMaterials;
    }, 0) ?? 0;

  return (
    <div className="min-h-screen bg-muted/40 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <Link
          to="/exams"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          ← Quay lại danh sách đề thi
        </Link>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">
                  {exam.title}
                </h1>
                {(examTypeLabel(exam.examTypeName) || exam.examFormatName) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {examTypeLabel(exam.examTypeName) && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        Loại đề: {examTypeLabel(exam.examTypeName)}
                      </span>
                    )}
                    {exam.examFormatName && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-3 py-1 text-sm font-semibold text-muted-foreground">
                        <Layers className="size-4" />
                        Định dạng: {exam.examFormatName}
                      </span>
                    )}
                  </div>
                )}
                {exam.description && (
                  <p className="mt-2 text-muted-foreground">{exam.description}</p>
                )}
              </div>
              {exam.isPremium && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-piemind-yellow px-3 py-1 text-sm font-bold text-[#8a6d00]">
                  Premium
                </span>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <span className="mx-auto mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="size-4.5" />
                </span>
                <p className="text-2xl font-extrabold text-foreground">
                  {durationMinutes}
                </p>
                <p className="text-sm text-muted-foreground">Phút</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <span className="mx-auto mb-2 flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <FileText className="size-4.5" />
                </span>
                <p className="text-2xl font-extrabold text-foreground">
                  {totalQuestions}
                </p>
                <p className="text-sm text-muted-foreground">Câu hỏi</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <span className="mx-auto mb-2 flex size-9 items-center justify-center rounded-lg bg-piemind-yellow text-[#8a6d00]">
                  <LayoutList className="size-4.5" />
                </span>
                <p className="text-2xl font-extrabold text-foreground">
                  {exam.sections?.length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Phần thi</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <span className="mx-auto mb-2 flex size-9 items-center justify-center rounded-lg bg-piemind-mint/60 text-[#146a5f]">
                  <Paperclip className="size-4.5" />
                </span>
                <p className="text-2xl font-extrabold text-foreground">
                  {totalMaterials}
                </p>
                <p className="text-sm text-muted-foreground">Tài liệu</p>
              </div>
            </div>

            {exam.sections && exam.sections.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-extrabold text-foreground">
                  Cấu trúc đề thi
                </h2>
                <div className="space-y-3">
                  {exam.sections.map((section) => (
                    <div
                      key={section.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:border-primary/30"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          {section.name}
                        </p>
                        {section.instructions && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {section.instructions}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-sm">
                        <span className="rounded-full border border-border bg-card px-2.5 py-1 font-bold text-muted-foreground">
                          {section.questionCount ?? 0} câu hỏi
                        </span>
                        {section.durationSeconds && section.durationSeconds > 0 && (
                          <span className="rounded-full border border-border bg-card px-2.5 py-1 font-bold text-muted-foreground">
                            {Math.floor(section.durationSeconds / 60)} phút
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lịch sử làm bài — bấm "Xem chi tiết" vào xem đáp án + giải thích. */}
            {hasToken && (
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-extrabold text-foreground">
                  Lịch sử làm bài
                </h2>
                {!attempts || attempts.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    Chưa có lượt thi nào — hoàn thành bài làm để xem điểm, đáp án
                    và giải thích chi tiết tại đây.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {attempts.map((attempt) => {
                      const isDone = attempt.status !== ExamAttemptStatus.IN_PROGRESS;
                      const when = formatDateTime(
                        attempt.submittedAt ?? attempt.startedAt,
                      );
                      return (
                        <div
                          key={attempt.id}
                          className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 p-4"
                        >
                          <span
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                              isDone
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="size-4.5" />
                            ) : (
                              <Clock className="size-4.5" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground">
                              {isDone ? `${attempt.score} điểm` : "Bài thi đang làm dở"}
                              {isDone && attempt.totalQuestions > 0 && (
                                <span className="ml-2 text-xs font-semibold text-muted-foreground">
                                  {attempt.correctCount}/{attempt.totalQuestions} câu đúng
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {isDone ? `Nộp bài ${when}` : `Bắt đầu ${when}`}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                              isDone
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-amber-300 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {isDone
                              ? attempt.status === ExamAttemptStatus.EXPIRED
                                ? "Hết giờ"
                                : "Đã nộp"
                              : "Đang làm"}
                          </span>
                          {isDone ? (
                            <Link
                              to={`/exams/${examId}/review/${attempt.id}`}
                              state={{ examId }}
                              className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:translate-y-px"
                            >
                              Xem chi tiết
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openAttempt(attempt)}
                              className="shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                            >
                              Tiếp tục làm bài
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-4">
              {authRequired && (
                <div className="w-full max-w-xl rounded-xl border border-amber-300 bg-amber-50 p-4 text-left">
                  <p className="font-semibold text-amber-900">
                    Đăng nhập để bắt đầu thi và lưu kết quả
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Lượt thi, điểm số và lịch sử bài làm được lưu theo tài khoản của bạn — hãy
                    đăng nhập trước khi bấm bắt đầu.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Link
                      to="/student/login"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/student/register"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Đăng ký tài khoản
                    </Link>
                    <button
                      type="button"
                      onClick={() => setAuthRequired(false)}
                      className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Để sau
                    </button>
                  </div>
                </div>
              )}
              {inProgressAttempt && (
                <p className="text-sm font-semibold text-amber-600">
                  Bạn có bài thi đang dở. Bấm vào để tiếp tục.
                </p>
              )}
              <button
                onClick={handleStart}
                disabled={starting || startExam.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
              >
                {starting || startExam.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang tải...
                  </>
                ) : inProgressAttempt ? (
                  <>
                    <Play className="h-5 w-5" />
                    Tiếp tục làm bài
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Bắt đầu làm bài
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
