export class AnswerQuestionCommand {
  constructor(
    public readonly questionId: number,
    public readonly userId: number,
    public readonly content: string,
  ) {}
}
