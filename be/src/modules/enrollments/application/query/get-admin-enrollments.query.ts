export class GetAdminEnrollmentsQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      keyword?: string;
      status?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
