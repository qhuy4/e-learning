export class AdminOrderDetailResponseDto {
  id: string;
  orderCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  couponId: string | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  status: number;
  paidAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  items: AdminOrderItemDto[];
}

export class AdminOrderItemDto {
  id: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string | null;
  instructorId: string;
  unitPrice: number;
  discountAmount: number;
  finalPrice: number;
}
