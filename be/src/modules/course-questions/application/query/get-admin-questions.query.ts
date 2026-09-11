export class GetAdminQuestionsQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      courseId?: number;
      status?: number;
      keyword?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
