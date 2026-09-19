export class DeleteReviewCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
