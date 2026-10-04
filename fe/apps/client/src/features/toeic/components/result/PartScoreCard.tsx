import { Eye } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import type { ToeicPartSection } from "../../types";

interface PartScoreCardProps {
  /** Nhãn part, ví dụ "Part 5". */
  label: string;
  /** Tên part, ví dụ "Incomplete Sentences". */
  title: string;
  section: ToeicPartSection;
  correct: number;
  total: number;
  /** Phần trăm câu đúng (0–100). */
  pct: number;
  /** Mở lại chính đề thi của part ở chế độ xem lại (?review=1&part=N). */
  onViewDetail: () => void;
}

/** Thẻ điểm một part: số câu đúng, phần trăm, thanh tiến độ và nút nhảy tới chi tiết. */
export function PartScoreCard({
  label,
  title,
  section,
  correct,
  total,
  pct,
  onViewDetail,
}: PartScoreCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-extrabold text-primary">
            {label}
          </span>
          <p className="mt-2 truncate text-sm font-extrabold text-foreground" title={title}>
            {title}
          </p>
          <p className="text-xs text-muted-foreground">
            {section === "listening" ? "Listening" : "Reading"} · {total} câu
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs font-extrabold tabular-nums text-foreground">
          {pct}%
        </span>
      </div>

      <p className="mt-3 text-2xl font-extrabold tabular-nums text-foreground">
        {correct}
        <span className="ml-1 text-sm font-semibold text-muted-foreground">/{total} câu đúng</span>
      </p>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[stroke-dashoffset]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <Button variant="outline" size="sm" className="mt-4 w-full gap-1.5" onClick={onViewDetail}>
        <Eye className="size-3.5" />
        Xem chi tiết
      </Button>
    </article>
  );
}
