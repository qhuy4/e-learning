import type { ReactNode } from "react";
import { formatBand } from "../../utils";

export interface CriterionScore {
  code: string;
  label: string;
  score: number;
}

interface CriteriaCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  criteria: CriterionScore[];
  className?: string;
}

/**
 * Writing / Speaking marking criteria breakdown (4 tiêu chí).
 * Scores are heuristic estimates — always shown with the "Ước tính" tag.
 */
export function CriteriaCard({
  title,
  description,
  icon,
  criteria,
  className = "",
}: CriteriaCardProps) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Ước tính
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {criteria.map((criterion) => {
          const ratio = Math.min(1, Math.max(0, criterion.score / 9));
          return (
            <div key={criterion.code}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  <span className="mr-1.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {criterion.code}
                  </span>
                  {criterion.label}
                </span>
                <span className="font-extrabold tabular-nums text-primary">
                  {formatBand(criterion.score)}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Điểm tiêu chí được ước tính từ mức độ hoàn thành bài làm — chấm chính thức cần giám khảo
        IELTS.
      </p>
    </div>
  );
}

/** Derives 4 criterion scores from an estimated band (±0.5 deterministic spread). */
export function criteriaFromBand(band: number, codes: [string, string, string, string], labels: [string, string, string, string]): CriterionScore[] {
  const deltas = [0.5, 0, -0.5, 0];
  return codes.map((code, index) => ({
    code,
    label: labels[index],
    score: Math.min(9, Math.max(0, Math.round((band + deltas[index]) * 2) / 2)),
  }));
}
