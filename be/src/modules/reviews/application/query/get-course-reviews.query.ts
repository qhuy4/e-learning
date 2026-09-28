export class GetCourseReviewsQuery {
  constructor(
    public readonly courseId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly rating?: number,
    public readonly sortOrder: 'asc' | 'desc' = 'desc',
    public readonly hasImage?: boolean,
  ) {}
}
