import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { OPTION_LETTERS, QUESTION_TYPE_META, TRUE_FALSE_NOT_GIVEN, YES_NO_NOT_GIVEN } from "../../constants";
import type { AnswerControl, IeltsQuestion } from "../../types";
import { normalizeAnswer } from "../../utils";

interface QuestionInputProps {
  question: IeltsQuestion;
  /** Current answer — letters for choice/multi, raw text otherwise. */
  value: string | null;
  onChange: (value: string) => void;
  /** Focus the input on mount (auto-advance to the next blank). */
  autoFocus?: boolean;
  compact?: boolean;
  /**
   * Chế độ xem lại (sau thi): tô màu đáp án đúng (xanh), đánh dấu lựa chọn sai
   * của bạn (đỏ), khóa không cho sửa. `correct` = đáp án đúng của câu.
   */
  review?: boolean;
  correct?: string | null;
}

function optionsFor(question: IeltsQuestion): string[] {
  if (question.options && question.options.length > 0) return question.options;
  if (question.type === "true-false-not-given") return TRUE_FALSE_NOT_GIVEN;
  if (question.type === "yes-no-not-given") return YES_NO_NOT_GIVEN;
  return [];
}

function lettersFor(question: IeltsQuestion): string[] {
  if (question.letters && question.letters.length > 0) return question.letters;
  return OPTION_LETTERS.slice(0, Math.max(question.options?.length ?? 4, 1));
}

function selectedLetters(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean);
}

/** Option này có phải đáp án đúng không — khớp letter HOẶC khớp đúng văn bản. */
function isCorrectOption(question: IeltsQuestion, letter: string, text: string, correct?: string | null): boolean {
  const key = (correct ?? question.correct) ?? "";
  if (!key) return false;
  const correctSet = key.split(",").map((v) => v.trim().toUpperCase()).filter(Boolean);
  return (
    correctSet.includes(letter.toUpperCase()) ||
    normalizeAnswer(key) === normalizeAnswer(text)
  );
}

/* ------------------------------------------------------------------ *
 * Controls
 * ------------------------------------------------------------------ */

function ChoiceControl({
  question,
  value,
  onChange,
  compact,
  review = false,
  correct = null,
}: {
  question: IeltsQuestion;
  value: string | null;
  onChange: (v: string) => void;
  compact?: boolean;
  review?: boolean;
  correct?: string | null;
}) {
  const options = optionsFor(question);
  const letters = lettersFor(question);

  return (
    <ul className="space-y-2">
      {options.map((opt, i) => {
        const letter = letters[i] ?? OPTION_LETTERS[i] ?? "?";
        const isSelected = (value ?? "").toUpperCase() === letter.toUpperCase();
        const isCorrect = review && isCorrectOption(question, letter, opt, correct);
        const isWrongPick = review && isSelected && !isCorrect;
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
            ? "border-red-500 bg-red-500 text-white"
            : isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted text-muted-foreground";
        return (
          <li key={letter}>
            <button
              type="button"
              onClick={() => onChange(letter)}
              aria-pressed={isSelected}
              disabled={review}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${shell} ${
                compact ? "py-2.5" : ""
              } disabled:cursor-default`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold ${badge}`}
              >
                {letter}
              </span>
              <span
                className={`${compact ? "text-base" : "text-[17px]"} leading-relaxed text-foreground`}
              >
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

function MultiControl({
  question,
  value,
  onChange,
  review = false,
  correct = null,
}: {
  question: IeltsQuestion;
  value: string | null;
  onChange: (v: string) => void;
  review?: boolean;
  correct?: string | null;
}) {
  const options = optionsFor(question);
  const letters = lettersFor(question);
  const picked = selectedLetters(value);
  const max = Math.max(question.correct.split(",").length, 1);

  const toggle = (letter: string) => {
    if (review) return;
    const has = picked.includes(letter);
    const next = has ? picked.filter((l) => l !== letter) : picked.length >= max ? picked : [...picked, letter];
    onChange(next.sort().join(","));
  };

  return (
    <div>
      <ul className="space-y-2">
        {options.map((opt, i) => {
          const letter = letters[i] ?? OPTION_LETTERS[i] ?? "?";
          const isSelected = picked.includes(letter.toUpperCase());
          const isCorrect = review && isCorrectOption(question, letter, opt, correct);
          const isWrongPick = review && isSelected && !isCorrect;
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
              ? "border-red-500 bg-red-500 text-white"
              : isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted text-muted-foreground";
          return (
            <li key={letter}>
              <button
                type="button"
                onClick={() => toggle(letter)}
                aria-pressed={isSelected}
                disabled={review}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${shell} disabled:cursor-default`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-extrabold ${badge}`}
                >
                  {letter}
                </span>
                <span className="text-base leading-relaxed text-foreground">{opt}</span>
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
      {!review && (
        <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
          Đã chọn <strong className="text-primary">{picked.length}</strong> / {max} đáp án — bấm lại
          để bỏ chọn.
        </p>
      )}
    </div>
  );
}

function TextControl({
  question,
  value,
  onChange,
  autoFocus,
  review = false,
  correct = null,
}: {
  question: IeltsQuestion;
  value: string | null;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  review?: boolean;
  correct?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const isLetterAnswer =
    question.type === "matching-paragraph-information" || question.type === "short-answer";

  // Xem lại: tô viền theo kết quả (khớp đáp án → xanh, có làm mà sai → đỏ).
  const raw = (value ?? "").trim();
  const key = correct ?? question.correct;
  const accepted = key.split("/").map((v) => normalizeAnswer(v));
  const isRight = review && raw.length > 0 && accepted.includes(normalizeAnswer(raw));
  const isWrong = review && raw.length > 0 && !isRight;
  const ring = isRight
    ? "border-emerald-400 bg-emerald-50"
    : isWrong
      ? "border-red-400 bg-red-50"
      : "border-border bg-background";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={review}
        placeholder={isLetterAnswer ? "?" : "Nhập câu trả lời…"}
        aria-label={`Câu trả lời cho câu ${question.num}`}
        className={`rounded-lg border px-3 py-2 text-base font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-default ${ring} ${
          isLetterAnswer ? "w-24 text-center uppercase" : "min-w-[220px] flex-1"
        }`}
      />
      <span className="text-[11px] text-muted-foreground">
        {raw ? "Đã trả lời" : "Chưa trả lời"}
      </span>
    </div>
  );
}

function SelectControl({
  question,
  value,
  onChange,
  review = false,
}: {
  question: IeltsQuestion;
  value: string | null;
  onChange: (v: string) => void;
  review?: boolean;
}) {
  const options = optionsFor(question);
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={review}
      aria-label={`Chọn đáp án cho câu ${question.num}`}
      className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2.5 text-base font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-default"
    >
      <option value="">— Chọn đáp án —</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ *
 * Registry
 * ------------------------------------------------------------------ */

/**
 * Question type registry: one component that switches on the question type
 * and renders a dedicated control for it (radio cards, checkbox cards,
 * inline answer box, dropdown select) with a safe fallback.
 */
export function QuestionInput({
  question,
  value,
  onChange,
  autoFocus,
  compact,
  review = false,
  correct = null,
}: QuestionInputProps) {
  const meta = QUESTION_TYPE_META[question.type];
  const control: AnswerControl = meta?.control ?? "text";

  switch (control) {
    case "choice":
      return (
        <ChoiceControl
          question={question}
          value={value}
          onChange={onChange}
          compact={compact}
          review={review}
          correct={correct}
        />
      );
    case "multi":
      return (
        <MultiControl
          question={question}
          value={value}
          onChange={onChange}
          review={review}
          correct={correct}
        />
      );
    case "select":
      return <SelectControl question={question} value={value} onChange={onChange} review={review} />;
    case "text":
      return (
        <TextControl
          question={question}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          review={review}
          correct={correct}
        />
      );
    default:
      // Unknown control — never crash the exam UI.
      return (
        <TextControl
          question={question}
          value={value}
          onChange={onChange}
          review={review}
          correct={correct}
        />
      );
  }
}
