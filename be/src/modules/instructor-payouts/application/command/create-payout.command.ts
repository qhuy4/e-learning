export class CreatePayoutCommand {
  constructor(
    public readonly data: {
      instructorId: number;
      payoutAccountId: number;
      periodStart: string;
      periodEnd: string;
    },
  ) {}
}
