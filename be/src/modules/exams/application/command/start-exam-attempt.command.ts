export class StartExamAttemptCommand {
  constructor(
    public readonly dto: { examId: number; userId: number },
    public readonly createdBy?: string,
  ) {}
}
