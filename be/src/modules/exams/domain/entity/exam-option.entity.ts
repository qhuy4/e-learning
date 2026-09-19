export class ExamOption {
  private constructor(
    public id: number | null,
    public questionId: number,
    public content: string,
    public isCorrect: boolean,
    public position: number,
    public createdAt: Date | null,
  ) {}

  static create(params: {
    questionId: number;
    content: string;
    isCorrect?: boolean;
    position: number;
  }): ExamOption {
    return new ExamOption(
      null,
      params.questionId,
      params.content,
      params.isCorrect ?? false,
      params.position,
      null,
    );
  }

  static restore(params: {
    id: number;
    questionId: number;
    content: string;
    isCorrect: boolean;
    position: number;
    createdAt: Date | null;
  }): ExamOption {
    return new ExamOption(
      params.id,
      params.questionId,
      params.content,
      params.isCorrect,
      params.position,
      params.createdAt,
    );
  }
}
