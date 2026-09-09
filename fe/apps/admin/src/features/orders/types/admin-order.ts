export interface AdminOrder {
  id: string;
  orderCode: string;
  userName: string;
  userEmail: string;
  itemCount: number;
  total: number;
  status: string;
  createdAt: Date | null;
}

export interface AdminOrderDetail {
  id: string;
  orderCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  couponId: string | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  status: string;
  paidAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string | null;
  instructorId: string;
  unitPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export const OrderStatus = {
  PENDING: "0",
  PAID: "1",
  FAILED: "2",
  REFUNDED: "3",
  CANCELLED: "4",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const orderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Chờ thanh toán",
  [OrderStatus.PAID]: "Đã thanh toán",
  [OrderStatus.FAILED]: "Thanh toán thất bại",
  [OrderStatus.REFUNDED]: "Đã hoàn tiền",
  [OrderStatus.CANCELLED]: "Đã hủy",
};

export const orderStatusClassName: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  [OrderStatus.PAID]: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  [OrderStatus.FAILED]: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  [OrderStatus.REFUNDED]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [OrderStatus.CANCELLED]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
