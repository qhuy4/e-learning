import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ListChecks, Minus, Plus } from "lucide-react";
import { TOEIC_PARTS } from "../../constants";
import type { ToeicQuestion } from "../../types";
import { QuestionReviewItem } from "./QuestionReviewItem";

interface QuestionReviewSectionProps {
  /** Toàn bộ câu trắc nghiệm trong phạm vi bài thi (các part đã chọn). */
  questions: ToeicQuestion[];
  answers: Record<number, string>;
}

interface PartGroup {
  part: number;
  label: string;
  title: string;
  questions: ToeicQuestion[];
  correct: number;
}

/**
 * "Giải thích chi tiết — đáp án từng part": 7 part dạng TAB ĐÓNG/MỞ (accordion)
 * — đề TOEIC 200 câu cuộn mãi không hết nên mỗi part gập lại được.
 * (Nút "Xem chi tiết" ở bảng điểm MỞ LẠI CHÍNH ĐỀ THI ở chế độ xem lại
 * `?review=1&part=N` — xem `ToeicResultPage`.)
 */
export function QuestionReviewSection({ questions, answers }: QuestionReviewSectionProps) {
  const groups = useMemo<PartGroup[]>(
    () =>
      TOEIC_PARTS.filter((p) => questions.some((q) => q.part === p.part)).map((p) => {
        const list = questions.filter((q) => q.part === p.part);
        return {
          part: p.part,
          label: p.label,
          title: p.title,
          questions: list,
          correct: list.filter((q) => answers[q.id] === q.correct).length,
        };
      }),
    [questions, answers],
  );

  // Part đầu tiên mở sẵn để thấy ví dụ; các part còn lại gập (đề 200 câu).
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const isOpen = (part: number) =>
    openMap[part] ?? (groups.length > 0 ? part === groups[0].part : false);

  const togglePart = (part: number) =>
    setOpenMap((prev) => ({ ...prev, [part]: !isOpen(part) }));

  if (groups.length === 0) return null;

  const allOpen = groups.every((g) => isOpen(g.part));
  const setAll = (open: boolean) =>
    setOpenMap(Object.fromEntries(groups.map((g) => [g.part, open])));

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-foreground">
              Giải thích chi tiết — đáp án từng part
            </h2>
            <p className="text-xs text-muted-foreground">
              {questions.length} câu trong phạm vi bài thi — bấm từng part để mở/đóng (đề dài
              không phải lướt hết).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAll(!allOpen)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          {allOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
          {allOpen ? "Thu gọn tất cả" : "Mở tất cả"}
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {groups.map((g) => {
          const open = isOpen(g.part);
          return (
            <article
              key={g.part}
              id={`part-${g.part}`}
              className="scroll-mt-24 rounded-xl border border-border bg-muted/30 p-4"
            >
              <header className="border-b border-border">
                <button
                  type="button"
                  onClick={() => togglePart(g.part)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-3 py-1 text-left transition-colors hover:text-primary"
                >
                  <h3 className="text-sm font-extrabold text-foreground">
                    {g.label} — {g.title}
                    <span className="ml-1.5 font-bold text-muted-foreground">
                      ·{" "}
                      <strong className="tabular-nums text-primary">
                        {g.correct}/{g.questions.length}
                      </strong>{" "}
                      câu đúng
                    </span>
                  </h3>
                  {open ? (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
              </header>

              {open && (
                <div className="mt-4 space-y-4">
                  {g.questions.map((q) => (
                    <QuestionReviewItem
                      key={q.id}
                      question={q}
                      userAnswer={answers[q.id] ?? null}
                    />
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
