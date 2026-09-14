export class GetCourseAnalyticsQuery {
  constructor(
    public readonly instructorId: number,
    public readonly courseId: number,
    public readonly dateRange: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) {}
}
