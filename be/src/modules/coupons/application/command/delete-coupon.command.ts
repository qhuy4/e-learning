export class DeleteCouponCommand {
  constructor(
    public readonly data: {
      id: number;
    },
  ) {}
}
