export class CreateOrderCommand {
  constructor(
    public readonly data: {
      userId: number;
      couponId?: number;
      items: {
        courseId: number;
        instructorId: number;
        unitPrice: number;
        finalPrice: number;
      }[];
    },
  ) {}
}
