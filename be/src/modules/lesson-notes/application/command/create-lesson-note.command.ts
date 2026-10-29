export class CreateLessonNoteCommand {
  constructor(
    public readonly userId: number,
    public readonly lessonId: number,
    public readonly noteTimeSeconds: number,
    public readonly content: string,
  ) {}
}
