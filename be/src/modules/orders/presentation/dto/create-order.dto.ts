export class CreateOrderDto {
  couponId?: number;
  items: {
    courseId: number;
    instructorId: number;
    unitPrice: number;
    finalPrice: number;
  }[];
}
