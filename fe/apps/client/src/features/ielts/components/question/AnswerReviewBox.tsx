import { Check, X } from "lucide-react";
import { QUESTION_TYPE_META } from "../../constants";
import type { IeltsQuestion } from "../../types";
import { isAnswerCorrect } from "../../utils";
import { ExplanationCard } from "../result/ExplanationCard";
import { VocabularyCard } from "../result/VocabularyCard";

interface AnswerReviewBoxProps {
  question: IeltsQuestion;
  /** Bài làm của bạn (letter cho trắc nghiệm, text cho điền chỗ trống; "" = chưa làm). */
  userAnswer: string | null;
}

function optionLetters(question: IeltsQuestion): string[] {
  if (question.letters) return question.letters;
  return (question.options ?? []).map((_, index) => String.fromCharCode(65 + index));
}

/** "A. text · B. text" cho trắc nghiệm, text thô cho điền — "?" khi trống. */
function displayAnswer(question: IeltsQuestion, value: string | null): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  const control = QUESTION_TYPE_META[question.type]?.control;
  if (control === "choice" || control === "multi" || control === "select") {
    const letters = optionLetters(question);
    const parts = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((letter) => {
        const option = question.options?.[letters.indexOf(letter)];
        return option ? `${letter} — ${option}` : letter;
      });
    if (parts.length > 0) return parts.join(" · ");
  }
  return raw;
}

/**
 * Hộp "đáp án bên dưới" ở chế độ XEM LẠI đề thi (sau khi nộp): đáp án đúng,
 * bài làm của bạn, giải thích + transcript/evidence — chỉ xuất hiện sau thi,
 * lúc thi không hiện.
 */
export function AnswerReviewBox({ question, userAnswer }: AnswerReviewBoxProps) {
  const correct = displayAnswer(question, question.correct);
  const yours = displayAnswer(question, userAnswer);
  const skipped = !yours;
  // Chấm đúng/sai theo đúng luật chấm của bài (isAnswerCorrect) — không tự suy đoán.
  const isRight = !skipped && isAnswerCorrect(question, userAnswer ?? "");

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
          <p className="text-base font-bold text-emerald-800">Đáp án đúng: {correct}</p>
        </div>
      )}

      <div className="flex items-start gap-2">
        {!skipped ? (
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
        <p
          className={`text-base font-semibold ${
            isRight ? "text-emerald-800" : !skipped ? "text-red-600" : "text-amber-700"
          }`}
        >
          {skipped
            ? "Bạn chưa trả lời câu này — câu này không được điểm"
            : `Bạn chọn: ${yours} — ${isRight ? "trả lời đúng" : "trả lời sai"}`}
        </p>
      </div>

      <ExplanationCard
        explanation={
          question.explanation ||
          `${isRight ? "Đúng" : skipped ? "Bỏ trống" : "Sai"} — đáp án đúng là ${correct ?? "—"}.`
        }
        transcript={question.module === "listening" ? question.transcript : undefined}
        evidence={question.module === "reading" ? question.evidence : undefined}
      />

      {(question.vocab?.length ?? 0) > 0 && <VocabularyCard words={question.vocab ?? []} />}
    </div>
  );
}
