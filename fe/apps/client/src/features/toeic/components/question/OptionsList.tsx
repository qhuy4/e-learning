import { Check, X } from "lucide-react";
import { OPTION_LETTERS } from "../../constants";

interface OptionsListProps {
  options: string[];
  selected: string | null;
  onSelect: (letter: string) => void;
  /** Larger hit areas for audio-only questions (Part 2). */
  large?: boolean;
  /** Part 6/7 long sentence options. */
  compact?: boolean;
  /**
   * Chế độ xem lại (sau thi): tô màu đáp án đúng (xanh), đánh dấu lựa chọn sai
   * của bạn (đỏ) và khóa không cho bấm chọn nữa. `correct` = letter đúng.
   */
  review?: boolean;
  correct?: string | null;
}

/** Shared A/B/C/D answer options. */
export function OptionsList({
  options,
  selected,
  onSelect,
  large = false,
  compact = false,
  review = false,
  correct = null,
}: OptionsListProps) {
  return (
    <ul className={large ? "space-y-3" : "space-y-2"}>
      {options.map((opt, i) => {
        const letter = OPTION_LETTERS[i] ?? "?";
        const isSelected = selected === letter;
        const isCorrect = review && Boolean(correct) && correct === letter;
        const isWrongPick = review && Boolean(correct) && isSelected && correct !== letter;
        const shell = isCorrect
          ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-400"
          : isWrongPick
            ? "border-red-400 bg-red-50 ring-1 ring-red-400"
            : isSelected
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border bg-card hover:border-primary/40 hover:bg-muted/40";
        const badge = isCorrect
          ? "border-emerald-500 bg-emerald-600 text-white"
          : isWrongPick
            ? "border-red-400 bg-red-500 text-white"
            : isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted text-muted-foreground";
        return (
          <li key={letter}>
            <button
              type="button"
              onClick={() => onSelect(letter)}
              aria-pressed={isSelected}
              disabled={review}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${shell} ${
                large ? "py-4" : ""
              } disabled:cursor-default`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold ${badge}`}
              >
                {letter}
              </span>
              <span className={`${compact ? "text-sm" : "text-[15px]"} leading-relaxed text-foreground`}>
                {opt}
              </span>
              {isCorrect && (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 self-center rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700">
                  <Check className="size-3" /> Đúng
                </span>
              )}
              {isWrongPick && (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 self-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-600">
                  <X className="size-3" /> Bạn chọn
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
