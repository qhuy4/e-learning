import { Bookmark, Highlighter, Underline, X } from "lucide-react";

interface HighlightToolbarProps {
  selectedText: string | null;
  paragraphLabel: string | null;
  bookmarked: boolean;
  onHighlight: () => void;
  onUnderline: () => void;
  onBookmark: () => void;
  onClear: () => void;
  onDismiss: () => void;
}

/** Floating text-selection toolbar of the Reading passage panel. */
export function HighlightToolbar({
  selectedText,
  paragraphLabel,
  bookmarked,
  onHighlight,
  onUnderline,
  onBookmark,
  onClear,
  onDismiss,
}: HighlightToolbarProps) {
  if (!selectedText) return null;

  const button =
    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary";

  return (
    <div className="sticky top-0 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/95 p-2 shadow-sm backdrop-blur">
      <span className="max-w-[240px] truncate rounded-lg bg-muted/60 px-2 py-1 text-[11px] font-semibold text-muted-foreground">
        “{selectedText.length > 40 ? `${selectedText.slice(0, 40)}…` : selectedText}”
      </span>
      <button type="button" onClick={onHighlight} className={button}>
        <Highlighter className="size-3.5" />
        Tô sáng
      </button>
      <button type="button" onClick={onUnderline} className={button}>
        <Underline className="size-3.5" />
        Gạch chân
      </button>
      <button type="button" onClick={onBookmark} className={button}>
        <Bookmark className={`size-3.5 ${bookmarked ? "fill-amber-400 text-amber-600" : ""}`} />
        {paragraphLabel ? `Đoạn ${paragraphLabel}` : "Bookmark"}
      </button>
      <button type="button" onClick={onClear} className={button}>
        <X className="size-3.5" />
        Xóa đánh dấu
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-auto rounded-lg px-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        Đóng
      </button>
    </div>
  );
}
