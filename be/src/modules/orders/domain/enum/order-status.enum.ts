export const OrderStatus = {
  PENDING: '0',
  PAID: '1',
  FAILED: '2',
  REFUNDED: '3',
  CANCELLED: '4',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
