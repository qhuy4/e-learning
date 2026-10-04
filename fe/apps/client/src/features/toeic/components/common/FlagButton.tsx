import { Flag } from "lucide-react";

interface FlagButtonProps {
  active: boolean;
  onToggle: () => void;
  /** Show the text label (utility panel) or icon only. */
  showLabel?: boolean;
  disabled?: boolean;
}

/** Marks a question for review (orange when active). */
export function FlagButton({ active, onToggle, showLabel = true, disabled = false }: FlagButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-amber-400 bg-amber-100 text-amber-800"
          : "border-border bg-card text-muted-foreground hover:border-amber-300 hover:text-amber-700"
      }`}
    >
      <Flag className={`size-4 ${active ? "fill-amber-400" : ""}`} />
      {showLabel && <span>{active ? "Đã đánh dấu" : "Đánh dấu câu này"}</span>}
    </button>
  );
}
