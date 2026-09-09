export class GetPaymentsQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      orderId?: number;
      status?: string;
      gateway?: string;
    },
  ) {}
}
