interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  /** Accessible description, shown under the bar when provided. */
  caption?: string;
}

/** Determinate progress bar (primary color, theme-consistent). */
export function ProgressBar({ value, max, className = "", caption }: ProgressBarProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div className={className}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      {caption && <p className="mt-1 text-[11px] text-muted-foreground">{caption}</p>}
    </div>
  );
}
