/** Kết quả của CreateQuestionCommand (question vừa lưu kèm relation). */
export interface CreateQuestionResult {
  id: number;
  courseId: number;
  userId: number;
  content: string;
  status: number;
  lastActivityAt: Date | null;
  createdAt: Date | null;
  course?: { id: number; title: string };
  user?: { id: number; name: string };
  answerCount: number;
}

export class CreateQuestionCommand {
  constructor(
    public readonly courseId: number,
    public readonly userId: number,
    public readonly content: string,
  ) {}
}
