export const PayoutStatus = {
  PENDING: 0,
  APPROVED: 1,
  PAID: 2,
  REJECTED: 3,
} as const;

export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];
