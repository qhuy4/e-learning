export class AdminOrderListResponseDto {
  id: string;
  orderCode: string;
  userName: string;
  userEmail: string;
  itemCount: number;
  total: number;
  status: string;
  createdAt: Date | null;
}
