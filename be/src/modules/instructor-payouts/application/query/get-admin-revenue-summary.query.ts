export class GetAdminRevenueSummaryQuery {
  constructor(
    public readonly data: {
      instructorId?: number;
    },
  ) {}
}
