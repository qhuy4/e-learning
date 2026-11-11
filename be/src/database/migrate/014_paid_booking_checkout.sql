-- Paid 1:1 booking checkout and its isolated VNPay transaction ledger.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS hourly_rate numeric(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount numeric(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status smallint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS payment_reference varchar(64) NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status
  ON bookings (payment_status);

CREATE TABLE IF NOT EXISTS booking_payments (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  gateway VARCHAR(24) NOT NULL DEFAULT 'VNPAY',
  status SMALLINT NOT NULL DEFAULT 1,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'VND',
  transaction_id VARCHAR(100),
  gateway_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_payments_status
  ON booking_payments (status);
