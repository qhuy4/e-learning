export class GetAdminOrdersQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      keyword?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
