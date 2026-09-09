export class GetMyEnrollmentsQuery {
  constructor(
    public readonly data: {
      userId: number;
      page: number;
      limit: number;
    },
  ) {}
}
