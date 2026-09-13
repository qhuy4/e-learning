export class GetMyEnrollmentsQuery {
  constructor(
    public readonly data: {
      userId: number;
      page: number;
      limit: number;
      keyword?: string;
      status?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
