export class GetLessonProgressQuery {
  constructor(
    public readonly userId: number,
    public readonly lessonId: number,
  ) {}
}
