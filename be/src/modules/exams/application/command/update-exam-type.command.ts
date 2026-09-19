export class UpdateExamTypeCommand {
  constructor(
    public readonly id: number,
    public readonly dto: { code?: string; name?: string; description?: string },
    public readonly createdBy?: string,
  ) {}
}
