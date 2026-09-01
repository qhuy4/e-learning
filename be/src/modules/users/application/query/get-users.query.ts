export class GetUsersQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      keyword?: string;
    },
  ) {}
}
