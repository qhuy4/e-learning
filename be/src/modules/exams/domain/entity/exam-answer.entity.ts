export class ExamAnswer {
  private constructor(
    public id: number | null,
    public attemptId: number,
    public questionId: number,
    public selectedOptionId: number | null,
    public answerText: string | null,
    public isCorrect: boolean,
    public earnedPoints: number,
    public createdAt: Date | null,
  ) {}

  static create(params: {
    attemptId: number;
    questionId: number;
    selectedOptionId?: number | null;
    answerText?: string | null;
    isCorrect?: boolean;
    earnedPoints?: number;
  }): ExamAnswer {
    return new ExamAnswer(
      null,
      params.attemptId,
      params.questionId,
      params.selectedOptionId ?? null,
      params.answerText ?? null,
      params.isCorrect ?? false,
      params.earnedPoints ?? 0,
      null,
    );
  }

  static restore(params: {
    id: number;
    attemptId: number;
    questionId: number;
    selectedOptionId: number | null;
    answerText: string | null;
    isCorrect: boolean;
    earnedPoints: number;
    createdAt: Date | null;
  }): ExamAnswer {
    return new ExamAnswer(
      params.id,
      params.attemptId,
      params.questionId,
      params.selectedOptionId,
      params.answerText,
      params.isCorrect,
      params.earnedPoints,
      params.createdAt,
    );
  }
}
