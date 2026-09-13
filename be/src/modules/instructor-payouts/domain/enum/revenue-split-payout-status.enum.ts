export const RevenueSplitPayoutStatus = {
  PENDING: 'pending',
  INCLUDED_IN_PAYOUT: 'included_in_payout',
  PAID: 'paid',
} as const;

export type RevenueSplitPayoutStatus = (typeof RevenueSplitPayoutStatus)[keyof typeof RevenueSplitPayoutStatus];
