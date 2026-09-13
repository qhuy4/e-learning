export class UpdatePayoutStatusCommand {
  constructor(
    public readonly data: {
      id: number;
      status: number;
      transactionRef?: string;
      paidAt?: string;
      note?: string;
    },
  ) {}
}
