export class DeleteExamFormatCommand {
  constructor(
    public readonly id: number,
    public readonly createdBy?: string,
  ) {}
}
