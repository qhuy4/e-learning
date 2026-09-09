export class GetAdminCouponsQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      keyword?: string;
      scope?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
