import { cn } from "@fe/lib/utils";
import {
  confidenceLabel,
  confidenceLevel,
  confidenceTextClass,
  scorePercent,
} from "../config/skill.config";

interface SkillScoreBarProps {
  name: string;
  score: number | null;
  confidence: number | null;
  onClick?: () => void;
}

/**
 * Dòng skill dạng: Tên ────── bar ────── 90%  Mức hỗ trợ
 */
export function SkillScoreBar({
  name,
  score,
  confidence,
  onClick,
}: SkillScoreBarProps) {
  const pct = scorePercent(score);
  const hasScore = pct != null;

  const body = (
    <>
      <span className="w-32 shrink-0 truncate text-sm font-medium" title={name}>
        {name}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        {hasScore && (
          <div
            className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">
        {hasScore ? `${pct}%` : "—"}
      </span>
      <span
        className={cn(
          "w-20 shrink-0 text-right text-xs font-medium",
          hasScore ? confidenceTextClass(confidence) : "text-muted-foreground",
        )}
        title="Mức dữ liệu hỗ trợ kết quả"
      >
        {hasScore
          ? confidenceLevel(confidence) === "low"
            ? "Cần thêm dữ liệu"
            : confidenceLabel(confidence)
          : "Chưa có dữ liệu"}
      </span>
    </>
  );

  if (!onClick) {
    return <div className="flex items-center gap-3">{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted/60"
    >
      {body}
    </button>
  );
}
