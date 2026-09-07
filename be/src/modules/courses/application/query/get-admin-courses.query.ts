export class GetAdminCoursesQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      level?: number;
      keyword?: string;
      status?: number;
      instructorId?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
