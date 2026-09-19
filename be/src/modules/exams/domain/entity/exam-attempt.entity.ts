import { ExamAttemptStatus } from '../enums/exam-attempt-status.enum';

export class ExamAttempt {
  private constructor(
    public id: number | null,
    public examId: number,
    public userId: number,
    public score: number,
    public correctCount: number,
    public totalQuestions: number,
    public status: ExamAttemptStatus,
    public startedAt: Date,
    public submittedAt: Date | null,
    public createdAt: Date | null,
  ) {}

  static create(params: {
    examId: number;
    userId: number;
    totalQuestions?: number;
  }): ExamAttempt {
    return new ExamAttempt(
      null,
      params.examId,
      params.userId,
      0,
      0,
      params.totalQuestions ?? 0,
      ExamAttemptStatus.IN_PROGRESS,
      new Date(),
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    examId: number;
    userId: number;
    score: number;
    correctCount: number;
    totalQuestions: number;
    status: ExamAttemptStatus;
    startedAt: Date;
    submittedAt: Date | null;
    createdAt: Date | null;
  }): ExamAttempt {
    return new ExamAttempt(
      params.id,
      params.examId,
      params.userId,
      params.score,
      params.correctCount,
      params.totalQuestions,
      params.status,
      params.startedAt,
      params.submittedAt,
      params.createdAt,
    );
  }

  update(params: Partial<Pick<ExamAttempt, 'score' | 'correctCount' | 'totalQuestions' | 'status' | 'submittedAt'>>) {
    if (params.score !== undefined) this.score = params.score;
    if (params.correctCount !== undefined) this.correctCount = params.correctCount;
    if (params.totalQuestions !== undefined) this.totalQuestions = params.totalQuestions;
    if (params.status !== undefined) this.status = params.status;
    if (params.submittedAt !== undefined) this.submittedAt = params.submittedAt;
  }
}
