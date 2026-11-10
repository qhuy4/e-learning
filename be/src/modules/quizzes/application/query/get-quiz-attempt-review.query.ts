export class GetQuizAttemptReviewQuery {
  constructor(
    public readonly attemptId: number,
    public readonly userId: number,
  ) {}
}
