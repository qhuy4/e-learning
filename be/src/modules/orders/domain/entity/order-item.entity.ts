export class OrderItem {
  private constructor(
    public readonly id: number | null,
    public readonly orderId: number,
    public readonly courseId: number,
    public readonly instructorId: number,
    public readonly unitPrice: number,
    public readonly discountAmount: number,
    public readonly finalPrice: number,
    public readonly createdAt: Date | null,
    public course?: any,
  ) {}

  static create(params: {
    orderId: number;
    courseId: number;
    instructorId: number;
    unitPrice: number;
    discountAmount?: number;
    finalPrice: number;
  }): OrderItem {
    return new OrderItem(
      null,
      params.orderId,
      params.courseId,
      params.instructorId,
      params.unitPrice,
      params.discountAmount ?? 0,
      params.finalPrice,
      null,
    );
  }

  static restore(params: {
    id: number;
    orderId: number;
    courseId: number;
    instructorId: number;
    unitPrice: number;
    discountAmount: number;
    finalPrice: number;
    createdAt: Date | null;
    course?: any;
  }): OrderItem {
    return new OrderItem(
      params.id,
      params.orderId,
      params.courseId,
      params.instructorId,
      params.unitPrice,
      params.discountAmount,
      params.finalPrice,
      params.createdAt,
      params.course,
    );
  }
}
