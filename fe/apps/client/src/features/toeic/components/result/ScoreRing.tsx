interface ScoreRingProps {
  value: number;
  max: number;
  size?: number;
  label?: string;
}

/** Circular score visualization (SVG ring). */
export function ScoreRing({ value, max, size = 168, label }: ScoreRingProps) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${value} trên ${max}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-primary transition-[stroke-dashoffset] duration-700"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold tabular-nums text-foreground">{value}</span>
        <span className="text-xs font-semibold text-muted-foreground">/ {max}</span>
        {label && <span className="mt-1 text-[11px] font-bold text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
