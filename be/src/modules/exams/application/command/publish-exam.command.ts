export class PublishExamCommand {
  constructor(
    public readonly id: number,
    public readonly createdBy?: string,
  ) {}
}
