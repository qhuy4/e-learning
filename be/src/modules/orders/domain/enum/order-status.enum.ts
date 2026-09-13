export const OrderStatus = {
  PENDING: 1,
  PAID: 3,
  FAILED: 4,
  REFUNDED: 5,
  CANCELLED: 6,
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
