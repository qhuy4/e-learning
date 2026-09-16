export interface Payment {
  id: string;
  orderId: string;
  transactionId: string | null;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date | null;
}

export interface PaymentDetail extends Payment {
  gatewayResponse: Record<string, any> | null;
  updatedAt: Date | null;
}

export const PaymentStatus = {
  PENDING: 1,
  PROCESSING: 2,
  COMPLETED: 3,
  FAILED: 4,
  CANCELLED: 5,
  REFUNDED: 6,
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Chờ xử lý",
  [PaymentStatus.PROCESSING]: "Đang xử lý",
  [PaymentStatus.COMPLETED]: "Thành công",
  [PaymentStatus.FAILED]: "Thất bại",
  [PaymentStatus.CANCELLED]: "Đã hủy",
  [PaymentStatus.REFUNDED]: "Đã hoàn tiền",
};

export const paymentStatusClassName: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  [PaymentStatus.PROCESSING]:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [PaymentStatus.COMPLETED]:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  [PaymentStatus.FAILED]:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  [PaymentStatus.CANCELLED]:
    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  [PaymentStatus.REFUNDED]:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export const PaymentGateway = {
  MOMO: "MOMO",
  VNPAY: "VNPAY",
  ZALOPAY: "ZALOPAY",
  STRIPE: "STRIPE",
} as const;

export type PaymentGateway = (typeof PaymentGateway)[keyof typeof PaymentGateway];

export const paymentGatewayLabel: Record<PaymentGateway, string> = {
  [PaymentGateway.MOMO]: "MoMo",
  [PaymentGateway.VNPAY]: "VNPay",
  [PaymentGateway.ZALOPAY]: "ZaloPay",
  [PaymentGateway.STRIPE]: "Stripe",
};

export function formatPaymentAmount(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}
