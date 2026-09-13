export class GetAdminRevenueSplitsQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      instructorId?: number;
      courseId?: number;
      payoutStatus?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
