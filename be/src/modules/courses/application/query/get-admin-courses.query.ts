export class GetAdminCoursesQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      keyword?: string;
      status?: number;
      instructorId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
