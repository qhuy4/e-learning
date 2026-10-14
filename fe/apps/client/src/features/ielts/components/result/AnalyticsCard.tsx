import type { ReactNode } from "react";

interface AnalyticsCardProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Generic analytics container used on the IELTS result page. */
export function AnalyticsCard({
  title,
  icon,
  description,
  children,
  className = "",
}: AnalyticsCardProps) {
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
  highlight?: "primary" | "amber" | "muted" | "emerald" | "sky";
}

const HIGHLIGHTS: Record<NonNullable<MetricBarProps["highlight"]>, string> = {
  primary: "bg-primary",
  amber: "bg-amber-400",
  muted: "bg-muted-foreground/50",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
};

/** Horizontal metric bar used inside analytics cards. */
export function MetricBar({
  label,
  value,
  max,
  display,
  highlight = "primary",
}: MetricBarProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-bold tabular-nums text-muted-foreground">{display}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${HIGHLIGHTS[highlight]}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

interface StackedBarSegment {
  label: string;
  value: number;
  className: string;
}

/** Full-width stacked bar (correct / wrong / skipped …) with a legend. */
export function StackedBar({ segments }: { segments: StackedBarSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={segment.className}
            style={{
              width: `${total > 0 ? (segment.value / total) * 100 : 0}%`,
            }}
            title={`${segment.label}: ${segment.value}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {segments.map((segment) => (
          <span key={segment.label} className="flex items-center gap-1.5">
            <span className={`size-2.5 rounded-sm ${segment.className}`} />
            {segment.label} · <strong className="text-foreground">{segment.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
