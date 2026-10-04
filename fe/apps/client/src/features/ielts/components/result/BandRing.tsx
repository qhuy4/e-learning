interface BandRingProps {
  /** IELTS band, 0–9 (halves allowed). */
  value: number;
  size?: number;
  label?: string;
  caption?: string;
}

/**
 * Circular IELTS band visualization (SVG ring, 0–9 scale).
 * Used for the Overall band on the result page.
 */
export function BandRing({ value, size = 200, label = "Overall band", caption }: BandRingProps) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = Math.min(1, Math.max(0, value / 9));
  const bandLabel = Number.isInteger(value) ? `${value}.0` : String(value);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${bandLabel} trên 9.0`}
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
        {/* Band tick marks (each whole band) */}
        {Array.from({ length: 9 }, (_, i) => {
          const angle = ((i + 1) / 9) * 2 * Math.PI - Math.PI / 2;
          const inner = r - stroke / 2 - 3;
          const outer = r - stroke / 2 - 8;
          return (
            <line
              key={i}
              x1={size / 2 + Math.cos(angle) * inner}
              y1={size / 2 + Math.sin(angle) * inner}
              x2={size / 2 + Math.cos(angle) * outer}
              y2={size / 2 + Math.sin(angle) * outer}
              className="stroke-border"
              strokeWidth={2}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold tabular-nums tracking-tight text-foreground">
          {bandLabel}
        </span>
        <span className="mt-0.5 text-xs font-bold text-muted-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground">/ 9.0</span>
        {caption && (
          <span className="mt-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
