export class DeleteLessonCommentCommand {
  constructor(
    public readonly userId: number,
    public readonly commentId: number,
  ) {}
}
