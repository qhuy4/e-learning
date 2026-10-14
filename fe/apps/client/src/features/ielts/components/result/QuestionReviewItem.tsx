import { Check, Flag, Minus, X } from "lucide-react";
import type { IeltsQuestion } from "../../types";
import { QUESTION_TYPE_META } from "../../constants";
import { ExplanationCard } from "./ExplanationCard";
import { VocabularyCard } from "./VocabularyCard";

/** Outcome of one question in the result review. */
export type ReviewState = "correct" | "wrong" | "skipped";

export interface QuestionReviewItemProps {
  question: IeltsQuestion;
  /** Raw answer stored for the candidate ("" when skipped). */
  yourAnswer: string;
  state: ReviewState;
  flagged?: boolean;
}

const STATE_UI: Record<ReviewState, { label: string; chip: string; icon: typeof Check }> = {
  correct: { label: "Đúng", chip: "border-emerald-300 bg-emerald-50 text-emerald-700", icon: Check },
  wrong: { label: "Sai", chip: "border-rose-300 bg-rose-50 text-rose-700", icon: X },
  skipped: {
    label: "Bỏ trống",
    chip: "border-border bg-muted text-muted-foreground",
    icon: Minus,
  },
};

const STATE_LABEL: Record<ReviewState, string> = {
  correct: "Đúng",
  wrong: "Sai",
  skipped: "Bỏ trống",
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function splitLetters(value: string): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function optionLetters(question: IeltsQuestion): string[] {
  if (question.letters) return question.letters;
  return (question.options ?? []).map((_, index) => String.fromCharCode(65 + index));
}

/** Formats a stored answer for questions without A–D options (fill-in / matching). */
function displayAnswer(question: IeltsQuestion, value: string): string {
  if (!value || !value.trim()) return "—";
  const control = QUESTION_TYPE_META[question.type].control;
  if (control === "choice" || control === "multi") {
    const letters = optionLetters(question);
    return splitLetters(value)
      .map((letter) => {
        const option = question.options?.[letters.indexOf(letter)];
        return option ? `${letter}. ${option}` : letter;
      })
      .join(" · ");
  }
  return value;
}

/**
 * One question of the "Giải thích chi tiết" list: number, stem, the A–D options
 * (candidate's pick highlighted, correct option marked) and the explanation.
 */
export function QuestionReviewItem({
  question,
  yourAnswer,
  state,
  flagged = false,
}: QuestionReviewItemProps) {
  const ui = STATE_UI[state];
  const Icon = ui.icon;
  const letters = optionLetters(question);
  const raw = (yourAnswer ?? "").trim();
  const yourSet = new Set(splitLetters(raw));
  const correctSet = new Set(splitLetters(question.correct));

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-extrabold tabular-nums text-foreground">
            {question.num}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {QUESTION_TYPE_META[question.type].label}
          </span>
          {flagged && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
              <Flag className="size-3" />
              Gắn cờ
            </span>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${ui.chip}`}
        >
          <Icon className="size-3.5" />
          {ui.label}
        </span>
      </div>

      <p className="mt-2.5 text-sm font-semibold leading-relaxed text-foreground">{question.stem}</p>
      {question.instruction && (
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {question.instruction}
        </p>
      )}

      {question.options && question.options.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {question.options.map((option, index) => {
            const letter = letters[index] ?? String.fromCharCode(65 + index);
            const isCorrect = correctSet.has(letter) || normalize(question.correct) === normalize(option);
            const isYours = yourSet.has(letter) || normalize(raw) === normalize(option);
            const tone = isCorrect
              ? isYours
                ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                : "border-emerald-300 bg-emerald-50 text-emerald-800"
              : isYours
                ? "border-rose-300 bg-rose-50 text-rose-800"
                : "border-border bg-muted/30 text-muted-foreground";
            return (
              <li
                key={`${question.id}-${letter}`}
                className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-xs ${tone}`}
              >
                <span className="flex items-start gap-2">
                  <span className="font-extrabold">{letter}.</span>
                  <span className="leading-relaxed">{option}</span>
                </span>
                {(isCorrect || isYours) && (
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                      isCorrect
                        ? "border-emerald-300 bg-card text-emerald-700"
                        : "border-rose-300 bg-card text-rose-700"
                    }`}
                  >
                    {isCorrect ? (isYours ? "Đúng · của bạn" : "Đáp án đúng") : "Của bạn"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Đáp án của bạn
            </p>
            <p
              className={`mt-0.5 break-words text-sm font-semibold ${
                state === "correct"
                  ? "text-emerald-600"
                  : state === "wrong"
                    ? "text-rose-600"
                    : "text-muted-foreground"
              }`}
            >
              {displayAnswer(question, raw)}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Đáp án đúng
            </p>
            <p className="mt-0.5 break-words text-sm font-semibold text-emerald-700">
              {displayAnswer(question, question.correct)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-3">
        <ExplanationCard
          explanation={
            question.explanation ||
            `${STATE_LABEL[state]} — đáp án đúng là ${displayAnswer(question, question.correct)}.`
          }
          transcript={question.module === "listening" ? question.transcript : undefined}
          evidence={question.module === "reading" ? question.evidence : undefined}
        />
      </div>

      {(question.vocab?.length ?? 0) > 0 && (
        <div className="mt-3">
          <VocabularyCard words={question.vocab ?? []} />
        </div>
      )}
    </article>
  );
}
