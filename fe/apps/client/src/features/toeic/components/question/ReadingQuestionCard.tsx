import type { ToeicQuestion } from "../../types";
import { FlagButton } from "../common/FlagButton";
import { SectionBadge } from "../common/SectionBadge";
import { AnswerReviewBox } from "./AnswerReviewBox";
import { OptionsList } from "./OptionsList";

interface ReadingQuestionCardProps {
  question: ToeicQuestion;
  selected: string | null;
  onSelect: (letter: string) => void;
  flagged?: boolean;
  onToggleFlag?: () => void;
  /** Xem lại bài đã nộp: tô màu đáp án + hiện hộp đáp án dưới câu. */
  review?: boolean;
}

/** Question card for Reading Parts 5–7 (passage shown separately by the page). */
export function ReadingQuestionCard({
  question,
  selected,
  onSelect,
  flagged = false,
  onToggleFlag,
  review = false,
}: ReadingQuestionCardProps) {
  const isBlank = question.kind === "text-completion" || question.kind === "comprehension";

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-sm font-extrabold text-background">
            {question.id}
          </span>
          <div>
            <SectionBadge label={`Part ${question.part}`} tone="primary" />
            <p className="mt-1 text-xs text-muted-foreground">
              {question.kind === "incomplete"
                ? "Chọn đáp án hoàn thành câu đúng nhất"
                : isBlank
                  ? "Chọn đáp án điền vào chỗ trống"
                  : "Chọn câu trả lời đúng nhất cho câu hỏi"}
            </p>
          </div>
        </div>
        {onToggleFlag && <FlagButton active={flagged} onToggle={onToggleFlag} showLabel={false} />}
      </header>

      <p
        className={`mb-4 whitespace-pre-line leading-relaxed text-foreground ${
          question.kind === "incomplete" ? "text-[15px] font-semibold" : "text-sm"
        }`}
      >
        {question.stem}
      </p>

      <OptionsList
        options={question.options}
        selected={selected}
        onSelect={onSelect}
        compact={question.kind !== "incomplete"}
        review={review}
        correct={review ? question.correct || null : null}
      />
      {review && <AnswerReviewBox question={question} userAnswer={selected} />}
      {/* Đang thi KHÔNG hiển thị đáp án — AnswerReviewBox chỉ bật khi xem lại sau thi. */}
    </article>
  );
}
