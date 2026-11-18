/** Một câu thực hành trong dictation (create/update). */
export interface DictationSentenceInput {
  sentence: string;
  startTime: number;
  endTime: number;
  position?: number;
  hint?: string | null;
}

/** Payload gửi lên khi tạo/cập nhật dictation (multipart có thể gói trong field `data`). */
export interface DictationInput {
  title?: string;
  description?: string | null;
  audioUrl?: string;
  level?: string;
  playLimit?: number | null;
  sentences?: DictationSentenceInput[];
}

/** Một câu trả lời khi submit bài dictation. */
export interface DictationAnswerInput {
  sentenceId: string;
  answerText?: string | null;
  isCorrect?: boolean;
  similarity?: number;
}
