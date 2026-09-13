export class GetAdminReviewReportsQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      status?: number;
      keyword?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
