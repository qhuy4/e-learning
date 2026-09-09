export class RefundPaymentCommand {
  constructor(
    public readonly data: {
      id: number;
      reason?: string;
    },
  ) {}
}
