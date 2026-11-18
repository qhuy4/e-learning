import { QuizAttemptStatus } from '../enums/quiz-attempt-status.enum';
export class QuizAttempt {
  private constructor(
    public id: number | null,
    public quizId: number,
    public userId: number,
    public score: number,
    public correctCount: number,
    public totalQuestions: number,
    public status: QuizAttemptStatus,
    public startedAt: Date,
    public submittedAt: Date | null,
    public createdAt: Date | null,
  ) {}

  static create(params: { quizId: number; userId: number }): QuizAttempt {
    return new QuizAttempt(null, params.quizId, params.userId, 0, 0, 0, QuizAttemptStatus.IN_PROGRESS, new Date(), null, null);
  }

  static restore(params: {
    id: number;
    quizId: number;
    userId: number;
    score: number;
    correctCount: number;
    totalQuestions: number;
    status: QuizAttemptStatus;
    startedAt: Date;
    submittedAt: Date | null;
    createdAt: Date | null;
  }): QuizAttempt {
    return new QuizAttempt(params.id, params.quizId, params.userId, params.score, params.correctCount, params.totalQuestions, params.status, params.startedAt, params.submittedAt, params.createdAt);
  }
}
