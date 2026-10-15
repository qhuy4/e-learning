-- 006: them cot thumbnail cho lessons (anh xem truoc khi bam phat video)
--
-- Key luu tren Cloudflare R2, vd: "lessons/thumbnails/xxx.jpg".
-- Idempotent: chay lai bao nhiêu lan cung duoc.

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(255);
