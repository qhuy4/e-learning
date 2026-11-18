export class QuizAnswer {
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
    selectedOptionId: number | null;
    answerText: string | null;
    isCorrect: boolean;
    earnedPoints: number;
  }): QuizAnswer {
    return new QuizAnswer(null, params.attemptId, params.questionId, params.selectedOptionId, params.answerText, params.isCorrect, params.earnedPoints, null);
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
  }): QuizAnswer {
    return new QuizAnswer(params.id, params.attemptId, params.questionId, params.selectedOptionId, params.answerText, params.isCorrect, params.earnedPoints, params.createdAt);
  }
}
