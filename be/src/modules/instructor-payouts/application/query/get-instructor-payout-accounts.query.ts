export class GetInstructorPayoutAccountsQuery {
  constructor(
    public readonly data: {
      instructorProfileId: number;
    },
  ) {}
}
