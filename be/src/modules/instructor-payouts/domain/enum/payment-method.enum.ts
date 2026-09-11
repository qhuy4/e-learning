export const PaymentMethod = {
  BANK_TRANSFER: 0,
  PAYPAL: 1,
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
