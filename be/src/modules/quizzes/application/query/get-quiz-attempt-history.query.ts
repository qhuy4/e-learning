export class GetQuizAttemptHistoryQuery {
  constructor(
    public readonly quizId: number,
    public readonly userId: number,
  ) {}
}
