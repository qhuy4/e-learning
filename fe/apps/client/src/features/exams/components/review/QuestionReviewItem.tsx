import { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown, Check, X, Lightbulb } from "lucide-react";
import type { ExamOption } from "../../types";
import { isTextAnswerType } from "../../utils";

const LETTERS = ["A", "B", "C", "D"];

/** One question in the detailed review (joined exam detail + candidate answers). */
export interface ReviewQuestion {
  questionId: number;
  /** 1-based display number, following the exam order. */
  number: number;
  sectionName: string;
  questionText: string;
  explanation: string | null;
  /** Kiểu câu hỏi (`MULTIPLE_CHOICE` | `ESSAY` | …) — chuỗi rỗng nếu thiếu dữ liệu. */
  type: string;
  options: ExamOption[];
  selectedOptionId: number | null;
  /** Câu trả lời văn bản (câu tự luận / điền chỗ trống) — `null` nếu không có. */
  answerText: string | null;
  answered: boolean;
  /** Câu trả lời mở: không chấm đúng/sai tự động, hiển thị riêng. */
  isText: boolean;
  isCorrect: boolean;
  earnedPoints: number;
}

const STATUS_META = {
  correct: { label: "Đúng", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  wrong: { label: "Sai", className: "border-red-300 bg-red-50 text-red-700" },
  empty: { label: "Chưa làm", className: "border-border bg-muted text-muted-foreground" },
  open: { label: "Trả lời mở", className: "border-primary/30 bg-primary/10 text-primary" },
} as const;

function letterOfOption(options: ExamOption[], optionId: number | null): string {
  if (optionId === null) return "—";
  const sorted = [...options].sort((a, b) => a.position - b.position);
  const index = sorted.findIndex((option) => option.id === optionId);
  return index >= 0 ? (LETTERS[index] ?? "?") : "—";
}

/**
 * Single question card in the review (sau khi nộp): options A–D có màu
 * đúng/sai, hộp "Đáp án đúng + Bạn chọn" kiểu TOEIC/IELTS và card
 * GIẢI THÍCH to mở ra bằng nút "Xem chi tiết".
 */
export function QuestionReviewItem({
  item,
  active,
}: {
  item: ReviewQuestion;
  /** Card đang được chọn ở cột điều hướng (viền ring nổi bật). */
  active?: boolean;
}) {
  const status = item.isText
    ? item.answered
      ? "open"
      : "empty"
    : !item.answered
      ? "empty"
      : item.isCorrect
        ? "correct"
        : "wrong";
  const statusMeta = STATUS_META[status];
  const options = [...item.options].sort((a, b) => a.position - b.position);
  const hasOptions = options.length > 0;
  const correctOption = options.find((o) => o.isCorrect) ?? null;
  const correctLetter = letterOfOption(options, correctOption?.id ?? null);
  const selectedOption = options.find((o) => o.id === item.selectedOptionId) ?? null;
  const selectedLetter = letterOfOption(options, item.selectedOptionId);
  const answerText = item.answerText?.trim() ?? "";
  // Câu điền khuyết CÓ key đáp án → server chấm đúng/sai, hiện text (không hiện
  // A/B/C/D như trắc nghiệm).
  const showRawText = !item.isText && isTextAnswerType(item.type);
  const correctTexts = options
    .filter((o) => o.isCorrect)
    .map((o) => o.content)
    .join(" / ");
  // Giải thích ẩn sau nút "Xem chi tiết" — bấm mới mở (card to như TOEIC/IELTS).
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <article
      id={`review-q-${item.number}`}
      className={`scroll-mt-3 rounded-xl border bg-card p-5 shadow-sm transition-shadow ${
        active ? "ring-2 ring-primary/50 " : ""
      }${
        status === "correct"
          ? "border-emerald-200"
          : status === "wrong"
            ? "border-red-200"
            : status === "open"
              ? "border-primary/30"
              : "border-border"
      }`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-extrabold text-primary-foreground">
            {item.number}
          </span>
          <span className="truncate text-xs font-semibold text-muted-foreground">
            {item.sectionName}
          </span>
          {item.earnedPoints > 0 && (
            <span className="text-xs font-bold text-emerald-600">+{item.earnedPoints} điểm</span>
          )}
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      </header>

      <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-relaxed text-foreground">
        {item.questionText}
      </p>

      {item.isText ? (
        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-primary">
            Câu tự luận / Trả lời mở
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            Đáp án của bạn:{" "}
            <strong
              className={`whitespace-pre-wrap ${
                answerText ? "text-foreground" : "text-muted-foreground italic"
              }`}
            >
              {answerText || "Chưa trả lời"}
            </strong>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Câu hỏi này không được chấm điểm tự động.
          </p>
        </div>
      ) : showRawText ? (
        /* Câu điền khuyết có key đáp án — chấm đúng/sai, hiện text như IELTS. */
        <div className="mt-4 space-y-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          {correctTexts && (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check className="size-3" />
              </span>
              <p className="text-sm font-bold leading-snug text-emerald-800 sm:text-base">
                Đáp án đúng: {correctTexts}
              </p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white ${
                !item.answered
                  ? "bg-amber-500"
                  : item.isCorrect
                    ? "bg-emerald-600"
                    : "bg-red-500"
              }`}
            >
              {item.answered && item.isCorrect ? (
                <Check className="size-3" />
              ) : (
                <X className="size-3" />
              )}
            </span>
            <p
              className={`text-sm font-semibold leading-snug sm:text-base ${
                !item.answered
                  ? "text-amber-700"
                  : item.isCorrect
                    ? "text-emerald-800"
                    : "text-red-600"
              }`}
            >
              {!item.answered
                ? "Bạn chưa trả lời câu này — câu này không được điểm"
                : `Đáp án của bạn: ${answerText || "—"} — ${
                    item.isCorrect ? "trả lời đúng" : "trả lời sai"
                  }`}
            </p>
          </div>
        </div>
      ) : hasOptions ? (
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {options.map((option, index) => {
            const isSelected = option.id === item.selectedOptionId;
            const tone = option.isCorrect
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : isSelected
                ? "border-red-300 bg-red-50 text-red-800"
                : "border-border bg-card text-muted-foreground";
            return (
              <li
                key={option.id}
                className={`flex items-start gap-2 rounded-lg border p-2 text-xs leading-relaxed ${tone}`}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-extrabold">
                  {LETTERS[index] ?? "?"}
                </span>
                <span className="min-w-0 flex-1">{option.content}</span>
                {option.isCorrect && (
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                )}
                {isSelected && !option.isCorrect && (
                  <XCircle className="size-3.5 shrink-0 text-red-500" />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          Đề không cung cấp danh sách phương án cho câu hỏi này.
        </p>
      )}

      {/* Hộp đáp án trắc nghiệm — cùng kiểu TOEIC/IELTS: đáp án đúng + bài làm. */}
      {!item.isText && !showRawText && hasOptions && (
        <div className="mt-4 space-y-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          {correctOption && (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check className="size-3" />
              </span>
              <p className="text-sm font-bold leading-snug text-emerald-800 sm:text-base">
                Đáp án đúng: {correctLetter} — {correctOption.content}
              </p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white ${
                !item.answered
                  ? "bg-amber-500"
                  : item.isCorrect
                    ? "bg-emerald-600"
                    : "bg-red-500"
              }`}
            >
              {item.answered && item.isCorrect ? (
                <Check className="size-3" />
              ) : (
                <X className="size-3" />
              )}
            </span>
            <p
              className={`text-sm font-semibold leading-snug sm:text-base ${
                !item.answered
                  ? "text-amber-700"
                  : item.isCorrect
                    ? "text-emerald-800"
                    : "text-red-600"
              }`}
            >
              {!item.answered
                ? "Bạn chưa trả lời câu này — câu này không được điểm"
                : `Bạn chọn: ${selectedLetter}${
                    selectedOption ? ` — ${selectedOption.content}` : ""
                  } — ${item.isCorrect ? "trả lời đúng" : "trả lời sai"}`}
            </p>
          </div>
        </div>
      )}

      {/* Giải thích — bấm "Xem chi tiết" để mở card to (giống trang TOEIC/IELTS). */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-muted/40">
        <button
          type="button"
          onClick={() => setShowExplanation((v) => !v)}
          aria-expanded={showExplanation}
          className="flex w-full items-center justify-between gap-2 p-3 text-left transition-colors hover:bg-muted/60"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <Lightbulb className="size-3.5 text-primary" />
            Giải thích chi tiết
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-primary">
            {showExplanation ? "Ẩn bớt" : "Xem chi tiết"}
            <ChevronDown
              className={`size-3.5 transition-transform ${showExplanation ? "rotate-180" : ""}`}
            />
          </span>
        </button>
        {showExplanation && (
          <div className="border-t border-border/70 p-3">
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-sky-700">
                <Lightbulb className="size-3.5" />
                Giải thích đáp án
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                {item.explanation ?? "Chưa có giải thích cho câu hỏi này trong dữ liệu đề thi."}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
