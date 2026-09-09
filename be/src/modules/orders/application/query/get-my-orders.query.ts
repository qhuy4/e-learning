export class GetMyOrdersQuery {
  constructor(
    public readonly data: {
      userId: number;
      page: number;
      limit: number;
      status?: string;
    },
  ) {}
}
