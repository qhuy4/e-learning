export class DeleteExamCommand {
  constructor(
    public readonly id: number,
    public readonly createdBy?: string,
  ) {}
}
