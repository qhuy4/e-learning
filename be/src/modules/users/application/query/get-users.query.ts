export class GetUsersQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      keyword?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      role?: number;
    },
  ) {}
}