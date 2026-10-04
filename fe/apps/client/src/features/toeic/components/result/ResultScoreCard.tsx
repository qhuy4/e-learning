import type { ReactNode } from "react";

interface ResultScoreCardProps {
  label: string;
  value: number;
  max: number;
  icon: ReactNode;
  hint?: string;
}

/** One score tile (Listening / Reading / Writing). */
export function ResultScoreCard({ label, value, max, icon, hint }: ResultScoreCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums text-foreground">
        {value}
        <span className="ml-1 text-sm font-semibold text-muted-foreground">/ {max}</span>
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
