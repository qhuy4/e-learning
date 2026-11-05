export class UpdateLessonCommentCommand {
  constructor(
    public readonly userId: number,
    public readonly commentId: number,
    public readonly content: string,
  ) {}
}
