import { Check, X } from "lucide-react";
import type { ToeicQuestion } from "../../types";

interface AnswerReviewBoxProps {
  question: ToeicQuestion;
  /** Letter bài làm của bạn (null = chưa chọn). */
  userAnswer: string | null;
}

function optionText(question: ToeicQuestion, letter: string | null): string | null {
  if (!letter) return null;
  const index = letter.charCodeAt(0) - 65;
  const text = question.options[index];
  return text !== undefined ? `${letter} — ${text}` : letter;
}

/**
 * Hộp "đáp án bên dưới" ở chế độ XEM LẠI đề thi (sau khi nộp): đáp án đúng,
 * bài làm của bạn và giải thích — chỉ xuất hiện sau thi, lúc thi không hiện.
 */
export function AnswerReviewBox({ question, userAnswer }: AnswerReviewBoxProps) {
  const correct = question.correct || null;
  const isRight = Boolean(correct && userAnswer && correct === userAnswer);

  return (
    <div
      data-testid="answer-review-box"
      className="mt-4 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4"
    >
      {correct && (
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check className="size-3" />
          </span>
          <p className="text-sm font-bold text-emerald-800">
            Đáp án đúng: {optionText(question, correct)}
          </p>
        </div>
      )}

      <div className="flex items-start gap-2">
        {userAnswer ? (
          <span
            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white ${
              isRight ? "bg-emerald-600" : "bg-red-500"
            }`}
          >
            {isRight ? <Check className="size-3" /> : <X className="size-3" />}
          </span>
        ) : (
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <X className="size-3" />
          </span>
        )}
        <p className={`text-sm font-semibold ${isRight ? "text-emerald-800" : userAnswer ? "text-red-600" : "text-amber-700"}`}>
          {userAnswer
            ? `Bạn chọn: ${optionText(question, userAnswer)} — ${isRight ? "trả lời đúng" : "trả lời sai"}`
            : "Bạn chưa chọn đáp án — câu này không được điểm"}
        </p>
      </div>

      {question.explanation && (
        <div className="rounded-lg border border-emerald-100 bg-white/80 p-3">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-700">
            Giải thích
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{question.explanation}</p>
        </div>
      )}

      {Boolean(question.vocab?.length || question.grammar) && (
        <div className="flex flex-wrap gap-1.5">
          {question.grammar && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
              Ngữ pháp: {question.grammar}
            </span>
          )}
          {question.vocab?.map((word) => (
            <span
              key={word}
              className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700"
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
