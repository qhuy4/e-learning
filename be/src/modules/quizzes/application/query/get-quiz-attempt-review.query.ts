/** Kết quả review sau khi nộp bài — GetQuizAttemptReviewQuery. */
export interface QuizAttemptReviewResult {
  attemptId: number | null;
  questions: Array<{
    id: number | null;
    question: string;
    isCorrect: boolean;
    earnedPoints: number;
    selectedAnswer: string | null;
    correctAnswer: string | null;
  }>;
}

export class GetQuizAttemptReviewQuery {
  constructor(
    public readonly attemptId: number,
    public readonly userId: number,
  ) {}
}
