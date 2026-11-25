ALTER TABLE revenue_splits
  ALTER COLUMN order_item_id DROP NOT NULL,
  ALTER COLUMN course_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_revenue_splits_booking_id
  ON revenue_splits(booking_id)
  WHERE booking_id IS NOT NULL;

WITH inserted AS (
  INSERT INTO revenue_splits (
    booking_id, order_item_id, instructor_id, course_id,
    gross_amount, platform_fee_pct, platform_fee_amount,
    instructor_share_pct, instructor_amount, coupon_discount,
    payout_status, created_at, updated_at
  )
  SELECT
    b.id, NULL, b.instructor_id, NULL, b.total_amount,
    100 - p.revenue_share_pct,
    ROUND(b.total_amount * (100 - p.revenue_share_pct) / 100),
    p.revenue_share_pct,
    b.total_amount - ROUND(b.total_amount * (100 - p.revenue_share_pct) / 100),
    0, 'pending', COALESCE(bp.updated_at, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP
  FROM bookings b
  JOIN booking_payments bp ON bp.booking_id = b.id AND bp.status = 2
  JOIN instructor_profiles p ON p.user_id = b.instructor_id
  WHERE b.payment_status = 2
  ON CONFLICT (booking_id) WHERE booking_id IS NOT NULL DO NOTHING
  RETURNING instructor_id, instructor_amount
), totals AS (
  SELECT instructor_id, SUM(instructor_amount) AS amount
  FROM inserted
  GROUP BY instructor_id
)
UPDATE instructor_profiles p
SET total_earned = p.total_earned + t.amount,
    pending_payout = p.pending_payout + t.amount,
    updated_at = CURRENT_TIMESTAMP
FROM totals t
WHERE p.user_id = t.instructor_id;
