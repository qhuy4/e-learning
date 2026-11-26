-- Personal 100% vouchers issued when an instructor rejects a booking.
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS recipient_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS max_booking_minutes INT;

ALTER TABLE coupons
  DROP CONSTRAINT IF EXISTS chk_coupons_max_booking_minutes;
ALTER TABLE coupons
  ADD CONSTRAINT chk_coupons_max_booking_minutes
  CHECK (max_booking_minutes IS NULL OR max_booking_minutes > 0);

CREATE INDEX IF NOT EXISTS idx_coupons_recipient_user_id
  ON coupons (recipient_user_id)
  WHERE recipient_user_id IS NOT NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS coupon_id BIGINT REFERENCES coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(12, 2) NOT NULL DEFAULT 0;
