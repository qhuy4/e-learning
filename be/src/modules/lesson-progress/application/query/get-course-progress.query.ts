export class GetCourseProgressQuery {
  constructor(
    public readonly userId: number,
    public readonly courseId: number,
  ) {}
}
