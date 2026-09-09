export class OrderResponseDto {
  id: string;
  orderCode: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  currency: string;
  status: string;
  paidAt: Date | null;
  createdAt: Date | null;
  items: OrderItemResponseDto[];
}

export class OrderItemResponseDto {
  id: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string | null;
  unitPrice: number;
  finalPrice: number;
}
