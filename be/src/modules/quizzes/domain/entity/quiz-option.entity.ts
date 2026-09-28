export class QuizOption {
  private constructor(
    public id: number | null,
    public questionId: number,
    public content: string,
    public isCorrect: boolean,
    public position: number,
  ) {}

  static restore(params: any): QuizOption {
    return new QuizOption(params.id, params.questionId, params.content, params.isCorrect, params.position);
  }
}
