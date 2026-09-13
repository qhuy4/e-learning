export const CouponScope = {
  ALL: '0',
  SPECIFIC_COURSES: '1',
} as const;

export type CouponScope = (typeof CouponScope)[keyof typeof CouponScope];
