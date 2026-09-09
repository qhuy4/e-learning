export const CouponType = {
  FIXED: '0',
  PERCENTAGE: '1',
} as const;

export type CouponType = (typeof CouponType)[keyof typeof CouponType];
