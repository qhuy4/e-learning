export class CreateReviewCommand {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly rating: number,
    public readonly comment?: string,
    public readonly imageUrls?: string[],
  ) {}
}
