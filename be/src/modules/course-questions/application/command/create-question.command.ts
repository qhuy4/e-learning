export class CreateQuestionCommand {
  constructor(
    public readonly courseId: number,
    public readonly userId: number,
    public readonly content: string,
  ) {}
}
