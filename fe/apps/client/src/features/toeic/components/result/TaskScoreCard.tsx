import { Eye } from "lucide-react";
import { Button } from "@fe/components/ui/button";

interface TaskScoreCardProps {
  /** Số task (1–8 Writing / 1–11 Speaking). */
  taskNumber: number;
  kind: "writing" | "speaking";
  /** Loại task, ví dụ "Viết câu từ tranh" / "Read a Text Aloud". */
  title: string;
  /** Đã hoàn thành (Writing ≥ 3 từ / Speaking đã ghi âm). */
  done: boolean;
  /** Nhãn trạng thái, ví dụ "Đã viết" / "Chưa ghi âm". */
  statusLabel: string;
  /** Thông số phụ: "12 từ · yêu cầu 10+" / "Trả lời 60s · chuẩn bị 30s". */
  metricLabel: string;
  /** Thanh tiến độ (Writing: số từ so với yêu cầu). Bỏ trống = không hiển thị. */
  progressValue?: number;
  progressMax?: number;
  progressDisplay?: string;
  /** Cuộn mượt tới khối chi tiết tương ứng (`task-{n}`). */
  onViewDetail: () => void;
}

/** Thẻ điểm một task Writing/Speaking: trạng thái, số liệu và nút nhảy tới chi tiết. */
export function TaskScoreCard({
  taskNumber,
  kind,
  title,
  done,
  statusLabel,
  metricLabel,
  progressValue,
  progressMax,
  progressDisplay,
  onViewDetail,
}: TaskScoreCardProps) {
  const hasProgress =
    progressValue !== undefined && progressMax !== undefined && progressMax > 0;
  const ratio = hasProgress
    ? Math.min(1, Math.max(0, (progressValue as number) / (progressMax as number)))
    : 0;

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-extrabold text-primary">
            Task {taskNumber}
          </span>
          <p className="mt-2 truncate text-sm font-extrabold text-foreground" title={title}>
            {title}
          </p>
          <p className="text-xs text-muted-foreground">
            {kind === "writing" ? "Writing" : "Speaking"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
            done
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <p className="mt-3 text-xs font-bold text-muted-foreground">{metricLabel}</p>

      {hasProgress && (
        <>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${ratio * 100}%` }} />
          </div>
          {progressDisplay && (
            <p className="mt-1.5 text-[11px] font-bold tabular-nums text-muted-foreground">
              {progressDisplay}
            </p>
          )}
        </>
      )}

      <Button variant="outline" size="sm" className="mt-4 w-full gap-1.5" onClick={onViewDetail}>
        <Eye className="size-3.5" />
        Xem chi tiết
      </Button>
    </article>
  );
}
