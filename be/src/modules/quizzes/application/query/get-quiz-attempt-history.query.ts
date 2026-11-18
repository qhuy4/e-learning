/** 1 lần làm bài trong lịch sử — kết quả GetQuizAttemptHistoryQuery. */
export interface QuizAttemptHistoryItem {
  id: number | null;
  score: number;
  correctCount: number;
  totalQuestions: number;
  submittedAt: Date | null;
  passed: boolean;
}

export class GetQuizAttemptHistoryQuery {
  constructor(
    public readonly quizId: number,
    public readonly userId: number,
  ) {}
}
