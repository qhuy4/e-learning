export class GetAdminPayoutsQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      instructorId?: number;
      status?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
