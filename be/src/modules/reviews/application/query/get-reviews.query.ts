export class GetReviewsQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      keyword?: string;
      courseId?: string;
      userId?: string;
      status?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
