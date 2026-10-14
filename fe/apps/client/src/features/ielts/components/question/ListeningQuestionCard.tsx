import { MessageSquare } from "lucide-react";
import { QUESTION_TYPE_META } from "../../constants";
import type { IeltsQuestion } from "../../types";
import { FlagButton } from "../common/FlagButton";
import { SectionBadge } from "../common/SectionBadge";
import { AnswerReviewBox } from "./AnswerReviewBox";
import { QuestionInput } from "./QuestionInput";

interface ListeningQuestionCardProps {
  question: IeltsQuestion;
  value: string | null;
  onChange: (value: string) => void;
  flagged?: boolean;
  onToggleFlag?: () => void;
  onFocusQuestion?: () => void;
  active?: boolean;
  /** Auto-focus the answer box of the active question (fast blank filling). */
  autoFocus?: boolean;
  /** Xem lại bài đã nộp: tô màu đáp án + hiện hộp đáp án dưới câu. */
  review?: boolean;
}

/** Question card used across the four Listening sections. */
export function ListeningQuestionCard({
  question,
  value,
  onChange,
  flagged = false,
  onToggleFlag,
  onFocusQuestion,
  active = false,
  autoFocus = false,
  review = false,
}: ListeningQuestionCardProps) {
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
              <span className="text-[11px] font-bold text-muted-foreground">
                Section {question.group}
              </span>
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
      {/* Đang thi KHÔNG hiển thị đáp án — AnswerReviewBox chỉ render khi xem lại
          (?review=1), giống hệt TOEIC. */}
      {review && <AnswerReviewBox question={question} userAnswer={value} />}

      <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <MessageSquare className="size-3.5" />
        {review
          ? "Xem lại sau thi — đáp án, giải thích và audio đều xem/nghe lại được."
          : "Trạng thái trả lời được lưu tự động khi bạn nhập / chọn đáp án."}
      </div>
    </article>
  );
}
