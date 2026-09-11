export interface RevenueSplit {
  id: string;
  grossAmount: number;
  platformFeePct: number;
  platformFeeAmount: number;
  instructorSharePct: number;
  instructorAmount: number;
  couponDiscount: number;
  payoutStatus: RevenueSplitPayoutStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
  course?: { id: string; title: string; thumbnail: string | null };
  instructor?: { id: string; name: string };
}

export interface RevenueSummary {
  totalGross: number;
  totalPlatformFee: number;
  totalInstructorAmount: number;
  totalSplits: number;
  pendingCount: number;
  paidCount: number;
}

export interface InstructorPayout {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalGross: number;
  totalPlatformFee: number;
  totalInstructorAmount: number;
  currency: string;
  status: PayoutStatus;
  paymentMethod: PaymentMethod;
  transactionRef: string | null;
  note: string | null;
  paidAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  instructor?: { id: string; name: string };
  payoutAccount?: {
    id: string;
    accountHolderName: string;
    bankName: string | null;
    accountNumber: string | null;
    paypalEmail: string | null;
  };
}

export const RevenueSplitPayoutStatus = {
  PENDING: "pending",
  INCLUDED_IN_PAYOUT: "included_in_payout",
  PAID: "paid",
} as const;

export type RevenueSplitPayoutStatus =
  (typeof RevenueSplitPayoutStatus)[keyof typeof RevenueSplitPayoutStatus];

export const revenueSplitPayoutStatusLabel: Record<RevenueSplitPayoutStatus, string> = {
  [RevenueSplitPayoutStatus.PENDING]: "Chờ xử lý",
  [RevenueSplitPayoutStatus.INCLUDED_IN_PAYOUT]: "Đã đưa vào thanh toán",
  [RevenueSplitPayoutStatus.PAID]: "Đã thanh toán",
};

export const revenueSplitPayoutStatusClassName: Record<RevenueSplitPayoutStatus, string> = {
  [RevenueSplitPayoutStatus.PENDING]:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  [RevenueSplitPayoutStatus.INCLUDED_IN_PAYOUT]:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [RevenueSplitPayoutStatus.PAID]:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export const PayoutStatus = {
  PENDING: 0,
  APPROVED: 1,
  PAID: 2,
  REJECTED: 3,
} as const;

export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];

export const payoutStatusLabel: Record<PayoutStatus, string> = {
  [PayoutStatus.PENDING]: "Chờ duyệt",
  [PayoutStatus.APPROVED]: "Đã duyệt",
  [PayoutStatus.PAID]: "Đã thanh toán",
  [PayoutStatus.REJECTED]: "Từ chối",
};

export const payoutStatusClassName: Record<PayoutStatus, string> = {
  [PayoutStatus.PENDING]:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  [PayoutStatus.APPROVED]:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [PayoutStatus.PAID]:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  [PayoutStatus.REJECTED]:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const PaymentMethod = {
  BANK_TRANSFER: 0,
  PAYPAL: 1,
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.BANK_TRANSFER]: "Chuyển khoản ngân hàng",
  [PaymentMethod.PAYPAL]: "PayPal",
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}
