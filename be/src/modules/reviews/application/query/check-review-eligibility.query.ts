export class CheckReviewEligibilityQuery {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
  ) {}
}
