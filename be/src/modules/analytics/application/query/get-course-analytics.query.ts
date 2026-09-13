export class GetCourseAnalyticsQuery {
  constructor(
    public readonly instructorId: number,
    public readonly courseId: number,
    public readonly dateRange: string,
  ) {}
}
