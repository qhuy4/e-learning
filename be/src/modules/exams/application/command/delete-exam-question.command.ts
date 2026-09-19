export class DeleteExamQuestionCommand {
  constructor(
    public readonly id: number,
    public readonly createdBy?: string,
  ) {}
}
