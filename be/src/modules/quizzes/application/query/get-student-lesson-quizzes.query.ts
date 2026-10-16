export class GetStudentLessonQuizzesQuery {
  constructor(
    public readonly lessonId: string,
    public readonly userId: number,
  ) {}
}
