import { Link } from "react-router";
import { ArrowRight, History, Trophy } from "lucide-react";
import { Skeleton } from "@fe/components/ui/skeleton";
import { ExamAttemptStatus } from "../../types";
import type { ExamAttemptWithExam } from "../../types";

interface RecentAttemptsSectionProps {
  attempts: ExamAttemptWithExam[] | undefined;
  isLoading: boolean;
}

const STATUS_META: Record<
  ExamAttemptStatus,
  { label: string; className: string; toPath: (a: ExamAttemptWithExam) => string; action: string }
> = {
  [ExamAttemptStatus.IN_PROGRESS]: {
    label: "Đang làm",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    toPath: (a) => attemptPath(a, false),
    action: "Tiếp tục",
  },
  [ExamAttemptStatus.SUBMITTED]: {
    label: "Đã nộp",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    toPath: (a) => attemptPath(a, true),
    action: "Xem kết quả",
  },
  [ExamAttemptStatus.EXPIRED]: {
    label: "Hết giờ",
    className: "bg-muted text-muted-foreground border-border",
    toPath: (a) => attemptPath(a, true),
    action: "Xem kết quả",
  },
};

/**
 * Route theo LOẠI đề (D9) — TOEIC/IELTS phải về đúng module UI của nó:
 * - đang làm → trang làm đề của module kèm `?examId=` (không rơi vào UI đề chung);
 * - đã nộp / hết giờ → trang kết quả module (dựng lại báo cáo từ attempt THẬT);
 * - GENERAL → route cũ `/exams/...`.
 */
function attemptPath(a: ExamAttemptWithExam, submitted: boolean): string {
  const name = (a.examTypeName ?? "").trim().toUpperCase();
  if (name === "TOEIC") {
    return submitted ? `/toeic/result?examId=${a.examId}` : `/toeic?examId=${a.examId}`;
  }
  if (name === "IELTS") {
    return submitted ? `/ielts/result?examId=${a.examId}` : `/ielts?examId=${a.examId}`;
  }
  return submitted ? `/exams/${a.examId}/result/${a.id}` : `/exams/${a.examId}/take`;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** "Gần đây bạn đã thi" — backed by GET /student/exams/attempts. */
export function RecentAttemptsSection({ attempts, isLoading }: RecentAttemptsSectionProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <History className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-extrabold text-foreground">Gần đây bạn đã thi</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const list = attempts ?? [];
  if (list.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-extrabold text-foreground">Gần đây bạn đã thi</h2>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{list.length} lần thi</span>
      </div>

      <ul className="divide-y divide-border">
        {list.map((attempt) => {
          const meta = STATUS_META[attempt.status] ?? STATUS_META[ExamAttemptStatus.SUBMITTED];
          const scoreText =
            attempt.score > 0
              ? `${attempt.score} điểm`
              : `${attempt.correctCount}/${attempt.totalQuestions} câu`;
          return (
            <li key={attempt.id}>
              <Link
                to={meta.toPath(attempt)}
                className="group flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted/60"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Trophy className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground group-hover:text-primary">
                      {attempt.examTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(attempt.startedAt)}
                      {attempt.status === ExamAttemptStatus.IN_PROGRESS ? " • chưa nộp" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-extrabold text-foreground">{scoreText}</span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                    {meta.action}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
