import { CornerDownRight } from "lucide-react";
import { QUESTION_TYPE_META } from "../../constants";
import type { IeltsQuestion } from "../../types";
import { FlagButton } from "../common/FlagButton";
import { SectionBadge } from "../common/SectionBadge";
import { AnswerReviewBox } from "./AnswerReviewBox";
import { QuestionInput } from "./QuestionInput";

interface ReadingQuestionCardProps {
  question: IeltsQuestion;
  value: string | null;
  onChange: (value: string) => void;
  flagged?: boolean;
  onToggleFlag?: () => void;
  onFocusQuestion?: () => void;
  onJumpToParagraph?: (label: string) => void;
  active?: boolean;
  autoFocus?: boolean;
  /** Xem lại bài đã nộp: tô màu đáp án + hiện hộp đáp án dưới câu. */
  review?: boolean;
}

/** Question card used across the three Reading passages. */
export function ReadingQuestionCard({
  question,
  value,
  onChange,
  flagged = false,
  onToggleFlag,
  onFocusQuestion,
  onJumpToParagraph,
  active = false,
  autoFocus = false,
  review = false,
}: ReadingQuestionCardProps) {
  const typeLabel = QUESTION_TYPE_META[question.type]?.label ?? question.type;

  return (
    <article
      onMouseDown={onFocusQuestion}
      className={`rounded-xl border border-border bg-card p-5 shadow-sm ${
        active ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-muted/40" : ""
      }`}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-extrabold text-background">
            {question.num}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SectionBadge label={typeLabel} tone="primary" />
              {question.paragraph && (
                <button
                  type="button"
                  onClick={() => onJumpToParagraph?.(question.paragraph ?? "")}
                  className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 transition-colors hover:bg-sky-100"
                  title="Nhảy tới đoạn văn trong bài đọc"
                >
                  <CornerDownRight className="size-3" />
                  Paragraph {question.paragraph}
                </button>
              )}
            </div>
            {question.instruction && (
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                {question.instruction}
              </p>
            )}
          </div>
        </div>
        {onToggleFlag && <FlagButton active={flagged} onToggle={onToggleFlag} showLabel={false} />}
      </header>

      <p className="mb-4 whitespace-pre-line text-[17px] font-semibold leading-relaxed text-foreground">
        {question.stem}
      </p>

      <QuestionInput
        question={question}
        value={value}
        autoFocus={autoFocus && !review}
        review={review}
        correct={review ? question.correct : null}
        onChange={(next) => {
          onFocusQuestion?.();
          onChange(next);
        }}
        compact
      />
      {/* Đang thi KHÔNG hiển thị đáp án — AnswerReviewBox chỉ bật khi xem lại sau thi. */}
      {review && <AnswerReviewBox question={question} userAnswer={value} />}
    </article>
  );
}
