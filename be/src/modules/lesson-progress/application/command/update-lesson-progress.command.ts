export class UpdateLessonProgressCommand {
  constructor(
    public readonly userId: number,
    public readonly courseId: number,
    public readonly lessonId: number,
    public readonly watchSeconds: number,
    public readonly progressPercent: number,
  ) {}
}
