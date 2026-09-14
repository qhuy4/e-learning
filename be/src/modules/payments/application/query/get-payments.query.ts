export class GetPaymentsQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      orderId?: number;
      status?: number;
      sortBy?: string;
      gateway?: string;
      sortOrder?: string;
    },
  ) {}
}
