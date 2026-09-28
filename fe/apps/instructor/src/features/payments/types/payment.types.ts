export interface PayoutAccount {
  id: number;
  instructorProfileId: number;
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
  verifiedAt: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Payout {
  id: number;
  periodStart: string;
  periodEnd: string;
  totalGross: number;
  totalPlatformFee: number;
  totalInstructorAmount: number;
  currency: string;
  status: number;
  paymentMethod: number;
  transactionRef: string | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string | null;
  payoutAccount: {
    id: number;
    accountHolderName: string;
    bankName: string | null;
    accountNumber: string | null;
    paypalEmail: string | null;
  } | null;
}

export interface CreatePayoutAccountRequest {
  accountType: string;
  accountHolderName: string;
  accountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  routingCode?: string;
  paypalEmail?: string;
  currency?: string;
  isPrimary?: boolean;
}

export interface UpdatePayoutAccountRequest {
  accountType?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  routingCode?: string;
  paypalEmail?: string;
  currency?: string;
  isPrimary?: boolean;
}

export interface PayoutRequest {
  payoutAccountId: number;
}

export interface CreateGrantTokenResponse {
  grantToken: string;
  casLinkUrl: string;
}

export interface VerifyAccountResponse {
  verified: boolean;
  message: string;
}

export const PAYOUT_STATUS_CONFIG: Record<number, { label: string; variant: string }> = {
  0: { label: "Đang chờ", variant: "warning" },
  1: { label: "Đã duyệt", variant: "info" },
  2: { label: "Đã thanh toán", variant: "success" },
  3: { label: "Bị từ chối", variant: "destructive" },
};
