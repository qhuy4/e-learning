import { Minus, Plus, RotateCcw, StickyNote } from "lucide-react";
import { useToeicExam } from "../../contexts/toeic-exam-context";
import { useCurrentQuestionId, useExamSection } from "../../hooks";
import { FlagButton } from "../common/FlagButton";

/** Right utility rail: flag, notes, zoom / font size. */
export function UtilityPanel() {
  const section = useExamSection();
  const questionId = useCurrentQuestionId();
  const { flags, toggleFlag, notes, setNote, fontScale, setFontScale } = useToeicExam();

  const isQuestionSection = section === "listening" || section === "reading";
  const active = questionId !== null && Boolean(flags[questionId]);

  return (
    <aside className="hidden w-60 shrink-0 xl:block" aria-label="Công cụ làm bài">
      <div className="h-full space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-sm">
        {/* Flag */}
        <div>
          <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Đánh dấu
          </h3>
          <FlagButton
            active={active}
            onToggle={() => questionId !== null && toggleFlag(questionId)}
            disabled={!isQuestionSection || questionId === null}
          />
          {!isQuestionSection && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {section === "speaking"
                ? "Speaking task không dùng cờ đánh dấu."
                : "Writing task không dùng cờ đánh dấu."}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="border-t border-border pt-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <StickyNote className="size-3.5" />
            Ghi chú
          </h3>
          <textarea
            value={questionId !== null ? (notes[questionId] ?? "") : ""}
            onChange={(e) => questionId !== null && setNote(questionId, e.target.value)}
            disabled={questionId === null}
            rows={4}
            placeholder={
              questionId === null
                ? "Chọn câu hỏi trắc nghiệm để ghi chú."
                : `Ghi chú cho câu ${questionId}...`
            }
            className="w-full resize-none rounded-lg border border-border bg-muted/40 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
        </div>

        {/* Zoom / font size */}
        <div className="border-t border-border pt-3">
          <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Cỡ chữ toàn trang
          </h3>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFontScale(fontScale - 0.05)}
              disabled={fontScale <= 0.9}
              aria-label="Giảm cỡ chữ"
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="text-sm font-extrabold tabular-nums text-foreground">
              {Math.round(fontScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setFontScale(fontScale + 0.05)}
              disabled={fontScale >= 1.3}
              aria-label="Tăng cỡ chữ"
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setFontScale(1)}
              disabled={fontScale === 1}
              aria-label="Khôi phục cỡ chữ"
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        </div>

        <p className="rounded-lg bg-muted/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
          Theo cấu hình kỳ thi: chế độ tối và máy tính bỏ túi đã ẩn; phóng to/làm nhỏ câu hỏi
          dùng thanh cỡ chữ ở trên.
        </p>
      </div>
    </aside>
  );
}
