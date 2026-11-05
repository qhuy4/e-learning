export class CreateLessonCommentCommand {
  constructor(
    public readonly userId: number,
    public readonly lessonId: number,
    public readonly content: string,
    public readonly parentId: number | null = null,
  ) {}
}
