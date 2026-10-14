import { useEffect } from "react";
import { AlertTriangle, Send, X } from "lucide-react";
import { Button } from "@fe/components/ui/button";

export interface ReviewModalStat {
  label: string;
  value: string | number;
  tone?: "default" | "amber" | "primary" | "emerald";
}

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stats: ReviewModalStat[];
  warning: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
}

const TONES: Record<NonNullable<ReviewModalStat["tone"]>, string> = {
  default: "text-foreground",
  amber: "text-amber-600",
  primary: "text-primary",
  emerald: "text-emerald-600",
};

/** Final confirmation dialog before submitting the IELTS exam. */
export function ReviewModal({
  open,
  onClose,
  onConfirm,
  stats,
  warning,
  confirmLabel = "Xác nhận nộp bài",
  confirmDisabled = false,
}: ReviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ielts-review-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Send className="size-4" />
            </span>
            <h2 id="ielts-review-modal-title" className="text-lg font-extrabold text-foreground">
              Nộp bài thi IELTS?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-muted/40 p-3 text-center">
              <p className={`text-xl font-extrabold tabular-nums ${TONES[s.tone ?? "default"]}`}>
                {s.value}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">{warning}</p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Quay lại làm bài
          </Button>
          <Button size="lg" className="gap-2" onClick={onConfirm} disabled={confirmDisabled}>
            <Send className="size-4" />
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
