export class GetLessonNotesQuery {
  constructor(
    public readonly userId: number,
    public readonly lessonId: number,
  ) {}
}
