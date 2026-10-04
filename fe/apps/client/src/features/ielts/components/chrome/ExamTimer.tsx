import { Clock } from "lucide-react";
import { formatClock } from "../../utils";

interface ExamTimerProps {
  seconds: number;
  label?: string;
  /** Turns red + pulses under this many seconds (default 5 minutes). */
  dangerThreshold?: number;
}

/** Sticky-header countdown clock for the active module (mm:ss / h:mm:ss). */
export function ExamTimer({ seconds, label = "Còn lại", dangerThreshold = 300 }: ExamTimerProps) {
  const danger = seconds <= dangerThreshold;
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
        danger ? "border-red-300 bg-red-50" : "border-border bg-muted/50"
      }`}
      role="timer"
      aria-label={`${label}: ${formatClock(seconds)}`}
    >
      <Clock className={`size-4 ${danger ? "animate-pulse text-red-600" : "text-muted-foreground"}`} />
      <span className="hidden text-xs font-semibold text-muted-foreground lg:inline">{label}</span>
      <span
        className={`font-mono text-lg font-extrabold tabular-nums ${
          danger ? "text-red-600" : "text-foreground"
        }`}
      >
        {formatClock(seconds)}
      </span>
    </div>
  );
}
