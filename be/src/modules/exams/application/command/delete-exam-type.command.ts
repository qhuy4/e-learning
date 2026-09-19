export class DeleteExamTypeCommand {
  constructor(
    public readonly id: number,
    public readonly createdBy?: string,
  ) {}
}
