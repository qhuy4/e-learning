export class CreateExamTypeCommand {
  constructor(
    public readonly dto: { code: string; name: string; description?: string },
    public readonly createdBy?: string,
  ) {}
}
