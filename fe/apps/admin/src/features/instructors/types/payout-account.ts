export interface PayoutAccount {
  id: string;
  instructorProfileId: string;
  accountType: string;
  accountHolderName: string;
  accountNumber: string | null;
  bankName: string | null;
  bankBranch: string | null;
  routingCode: string | null;
  paypalEmail: string | null;
  currency: string;
  isPrimary: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export const AccountType = {
  BANK_TRANSFER: "bank_transfer",
  PAYPAL: "paypal",
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const accountTypeLabel: Record<AccountType, string> = {
  [AccountType.BANK_TRANSFER]: "Chuyển khoản ngân hàng",
  [AccountType.PAYPAL]: "PayPal",
};

export const accountTypeClassName: Record<AccountType, string> = {
  [AccountType.BANK_TRANSFER]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [AccountType.PAYPAL]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};
