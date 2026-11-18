/** Kết quả của AnswerQuestionCommand (answer vừa lưu kèm user). */
export interface AnswerQuestionResult {
  id: number;
  questionId: number;
  userId: number;
  content: string;
  status: number;
  createdAt: Date | null;
  user?: { id: number; name: string };
}

export class AnswerQuestionCommand {
  constructor(
    public readonly questionId: number,
    public readonly userId: number,
    public readonly content: string,
  ) {}
}
