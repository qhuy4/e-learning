import { Check, FileText, Headphones, X } from "lucide-react";
import { OPTION_LETTERS } from "../../constants";
import type { ToeicQuestion } from "../../types";

interface QuestionReviewItemProps {
  question: ToeicQuestion;
  /** Lời giải thích chi tiết cho câu này (mở khóa cho mọi thí sinh). */
  explanation?: string;
  userAnswer: string | null;
}

type ItemStatus = "correct" | "wrong" | "empty";

const STATUS_META: Record<ItemStatus, { label: string; className: string }> = {
  correct: { label: "Trả lời đúng", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  wrong: { label: "Trả lời sai", className: "border-red-300 bg-red-50 text-red-700" },
  empty: { label: "Chưa làm", className: "border-border bg-muted text-muted-foreground" },
};

/** Một câu trắc nghiệm trong phần giải thích chi tiết: đáp án + đáp án đúng + giải thích. */
export function QuestionReviewItem({
  question,
  explanation,
  userAnswer,
}: QuestionReviewItemProps) {
  const status: ItemStatus =
    userAnswer === null ? "empty" : userAnswer === question.correct ? "correct" : "wrong";
  const meta = STATUS_META[status];
  const isListening = question.section === "listening";

  const transcript = question.stimulus?.lines
    ?.map((line) => (line.speaker ? `${line.speaker}: ${line.text}` : line.text))
    .join("\n");

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-xs font-extrabold text-background">
            {question.id}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {isListening ? "Listening" : "Reading"} ·{" "}
            {question.kind === "response" ? "Nghe — chỉ có audio" : "Trắc nghiệm 4 lựa chọn"}
          </span>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.className}`}
        >
          {meta.label}
        </span>
      </header>

      <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-relaxed text-foreground">
        {question.stem || "(Câu hỏi chỉ phát trong audio — không có chữ trên màn hình)"}
      </p>

      {transcript && (
        <details className="mt-3 rounded-xl border border-border bg-muted/30">
          <summary className="flex cursor-pointer items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">
            {isListening ? (
              <Headphones className="size-3.5 shrink-0" />
            ) : (
              <FileText className="size-3.5 shrink-0" />
            )}
            {isListening ? "Transcript đoạn nghe" : "Nội dung bài đọc"}
          </summary>
          <pre className="whitespace-pre-wrap border-t border-border px-3 py-2.5 font-sans text-xs leading-relaxed text-foreground">
            {transcript}
          </pre>
        </details>
      )}

      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const letter = OPTION_LETTERS[i] ?? "?";
          const isCorrect = letter === question.correct;
          const isUser = letter === userAnswer;
          const tone = isCorrect
            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
            : isUser
              ? "border-red-300 bg-red-50 text-red-800"
              : "border-border bg-card text-muted-foreground";
          return (
            <li
              key={letter}
              className={`flex items-start gap-2 rounded-lg border p-2 text-xs leading-relaxed ${tone}`}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-extrabold">
                {letter}
              </span>
              <span className="min-w-0 flex-1">{opt}</span>
              {isCorrect && (
                <span className="flex shrink-0 items-center gap-1 text-[10px] font-extrabold uppercase">
                  <Check className="size-3.5" />
                  Đáp án đúng
                </span>
              )}
              {isUser && !isCorrect && (
                <span className="flex shrink-0 items-center gap-1 text-[10px] font-extrabold uppercase">
                  <X className="size-3.5" />
                  Bạn chọn
                </span>
              )}
              {isUser && isCorrect && (
                <span className="shrink-0 text-[10px] font-extrabold uppercase">
                  Bạn chọn
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {userAnswer === null && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Bạn chưa chọn đáp án cho câu này — được tính 0 điểm.
        </p>
      )}

      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-primary">
          <Check className="size-3.5" />
          Giải thích — đáp án {question.correct}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">
          {explanation ?? question.explanation}
        </p>
        {question.grammar && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            <strong className="text-foreground">Ngữ pháp:</strong> {question.grammar}
          </p>
        )}
        {question.vocab && question.vocab.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            <strong className="text-foreground">Từ vựng:</strong> {question.vocab.join(" · ")}
          </p>
        )}
      </div>
    </article>
  );
}
