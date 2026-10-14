import { useMemo } from "react";
import { ListChecks } from "lucide-react";
import { QuestionReviewItem } from "./QuestionReviewItem";
import type { ReviewQuestion } from "./QuestionReviewItem";

/** Bộ lọc hiển thị — state sống ở trang Review để điều hướng câu trước/sau biết theo. */
export type ReviewFilter = "ALL" | "CORRECT" | "WRONG" | "EMPTY" | "TEXT";

const FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "CORRECT", label: "Đúng" },
  { value: "WRONG", label: "Sai" },
  { value: "EMPTY", label: "Chưa làm" },
  { value: "TEXT", label: "Câu tự luận" },
];

export const FILTER_MATCH: Record<ReviewFilter, (item: ReviewQuestion) => boolean> = {
  ALL: () => true,
  // Đúng/sai chỉ áp dụng cho câu có phương án — câu tự luận không chấm tự động.
  CORRECT: (item) => !item.isText && item.isCorrect,
  WRONG: (item) => !item.isText && item.answered && !item.isCorrect,
  EMPTY: (item) => !item.answered,
  TEXT: (item) => item.isText,
};

interface QuestionReviewListProps {
  /** TOÀN BỘ câu hỏi (dùng cho tiêu đề + đếm chip bộ lọc). */
  items: ReviewQuestion[];
  filter: ReviewFilter;
  onFilterChange: (filter: ReviewFilter) => void;
  /** Số thứ tự card đang được chọn ở footer / cột điều hướng. */
  activeNumber: number;
}

/** Complete detailed review: every question with options, answers and explanation. */
export function QuestionReviewList({
  items,
  filter,
  onFilterChange,
  activeNumber,
}: QuestionReviewListProps) {
  const counts = useMemo(
    () => ({
      CORRECT: items.filter((item) => !item.isText && item.isCorrect).length,
      WRONG: items.filter((item) => !item.isText && item.answered && !item.isCorrect).length,
      EMPTY: items.filter((item) => !item.answered).length,
      TEXT: items.filter((item) => item.isText).length,
    }),
    [items],
  );

  const visible = items.filter(FILTER_MATCH[filter]);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-foreground">
              Giải thích chi tiết — đầy đủ câu hỏi
            </h2>
            <p className="text-xs text-muted-foreground">
              Toàn bộ {items.length} câu trong đề: phương án bạn chọn, đáp án đúng, câu trả
              lời tự luận và giải thích.
            </p>
          </div>
        </div>

        <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-border bg-muted/60 p-1">
          {FILTERS.map((option) => {
            const count =
              option.value === "ALL" ? items.length : counts[option.value as keyof typeof counts];
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange(option.value)}
                aria-pressed={filter === option.value}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  filter === option.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}{" "}
                <span className="tabular-nums text-muted-foreground">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Không có câu nào ở bộ lọc này.
          </p>
        ) : (
          visible.map((item) => (
            <QuestionReviewItem
              key={item.questionId}
              item={item}
              active={item.number === activeNumber}
            />
          ))
        )}
      </div>
    </section>
  );
}
