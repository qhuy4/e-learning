/** Payment state is intentionally separate from the session state. */
export enum BookingPaymentStatus {
  FAILED = 0,
  PENDING = 1,
  PAID = 2,
}
