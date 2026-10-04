import type { ReactNode } from "react";

interface AnalyticsCardProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Generic analytics container used on the result page. */
export function AnalyticsCard({ title, icon, description, children, className = "" }: AnalyticsCardProps) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </span>
          )}
          <div>
            <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  display?: string;
  highlight?: "primary" | "amber" | "muted";
}

/** Horizontal metric bar used inside analytics cards. */
export function MetricBar({ label, value, max, display, highlight = "primary" }: MetricBarProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const barColor =
    highlight === "amber" ? "bg-amber-400" : highlight === "muted" ? "bg-muted-foreground/50" : "bg-primary";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-bold tabular-nums text-muted-foreground">{display}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
