export const CouponOwnerType = {
  ADMIN: '0',
  INSTRUCTOR: '1',
} as const;

export type CouponOwnerType = (typeof CouponOwnerType)[keyof typeof CouponOwnerType];
