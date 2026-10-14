import { useEffect } from "react";
import { AlertTriangle, Flag, X } from "lucide-react";
import { Button } from "@fe/components/ui/button";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answered: number;
  unanswered: number;
  flagged: number;
  total: number;
  /** Nhãn nút xác nhận (VD: trạng thái đang nộp bài). */
  confirmLabel?: string;
  confirmDisabled?: boolean;
}

/** Final confirmation dialog before submitting the exam. */
export function ReviewModal({
  open,
  onClose,
  onConfirm,
  answered,
  unanswered,
  flagged,
  total,
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

  const stats = [
    { label: "Đã làm", value: answered, className: "text-foreground" },
    { label: "Chưa làm", value: unanswered, className: "text-amber-600" },
    { label: "Đánh dấu", value: flagged, className: "text-primary" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Flag className="size-4" />
            </span>
            <h2 id="review-modal-title" className="text-lg font-extrabold text-foreground">
              Nộp bài thi?
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

        <div className="mt-5 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-muted/40 p-3 text-center">
              <p className={`text-xl font-extrabold ${s.className}`}>{s.value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            Bạn đang nộp với <strong>{answered}/{total}</strong> câu đã làm. Sau khi nộp,
            bài làm sẽ được chấm điểm ngay và không thể thay đổi.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Quay lại làm bài
          </Button>
          <Button onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
