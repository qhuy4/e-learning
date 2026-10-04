import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import type { ToeicQuestion } from "../../types";
import { FlagButton } from "../common/FlagButton";
import { SectionBadge } from "../common/SectionBadge";
import { AnswerReviewBox } from "./AnswerReviewBox";
import { OptionsList } from "./OptionsList";

interface ListeningQuestionCardProps {
  question: ToeicQuestion;
  selected: string | null;
  onSelect: (letter: string) => void;
  flagged?: boolean;
  onToggleFlag?: () => void;
  /** Xem lại bài đã nộp: tô màu đáp án + hiện hộp đáp án dưới câu. */
  review?: boolean;
}

/** Question card for Listening Parts 1–4 (photo / response / conversation / talk). */
export function ListeningQuestionCard({
  question,
  selected,
  onSelect,
  flagged = false,
  onToggleFlag,
  review = false,
}: ListeningQuestionCardProps) {
  const isPhoto = question.kind === "photo";
  const isResponse = question.kind === "response";
  const [imgFailed, setImgFailed] = useState(false);
  const imageUrl = question.stimulus?.imageUrl;

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-sm font-extrabold text-background">
            {question.id}
          </span>
          <div>
            <SectionBadge label={`Part ${question.part}`} tone="primary" />
            <p className="mt-1 text-xs text-muted-foreground">
              {isPhoto
                ? "Chọn câu mô tả đúng bức tranh"
                : isResponse
                  ? "Chọn câu trả lời phù hợp nhất"
                  : question.stem || "Nghe đoạn thoại rồi trả lời"}
            </p>
          </div>
        </div>
        {onToggleFlag && (
          <FlagButton active={flagged} onToggle={onToggleFlag} showLabel={false} />
        )}
      </header>

      {isPhoto &&
        (imageUrl && !imgFailed ? (
          <div className="mb-3 overflow-hidden rounded-xl border border-border bg-muted/40">
            <img
              src={imageUrl}
              alt={question.stimulus?.title ?? `Ảnh câu ${question.id}`}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="max-h-[32vh] w-full object-contain"
            />
          </div>
        ) : (
          <div className="mb-3 flex h-36 w-full items-center justify-center rounded-xl border border-border bg-gradient-to-br from-muted via-muted/60 to-background">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="mx-auto size-7" />
              <p className="mt-1.5 text-xs font-bold">Ảnh minh họa — {question.stimulus?.title}</p>
              <p className="text-[11px]">
                {imageUrl ? "Không tải được ảnh từ máy chủ" : `Chưa có file ảnh cho câu ${question.id}`}
              </p>
            </div>
          </div>
        ))}

      {question.stem && !isResponse && (
        <p
          className={`mb-3 font-semibold leading-relaxed text-foreground ${
            isPhoto ? "text-sm" : "text-[15px]"
          }`}
        >
          {question.stem}
        </p>
      )}
      {isResponse && (
        <p className="mb-3 text-xs text-muted-foreground">
          Nghe câu hỏi ở thẻ audio phía trên, sau đó chọn câu trả lời tốt nhất.
        </p>
      )}

      <OptionsList
        options={question.options}
        selected={selected}
        onSelect={onSelect}
        large={isResponse}
        review={review}
        correct={review ? question.correct || null : null}
      />
      {review && <AnswerReviewBox question={question} userAnswer={selected} />}
      {/* Đang thi KHÔNG hiển thị đáp án — AnswerReviewBox chỉ bật khi xem lại sau thi. */}
    </article>
  );
}
