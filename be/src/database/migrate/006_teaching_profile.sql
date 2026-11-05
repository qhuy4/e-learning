-- ============================================================
-- 006 — Teaching Profile (instructor tự khai báo)
-- Các cột này phục vụ trang Teaching Profile + extractor EXPERIENCE.
-- ============================================================

-- ============================ UP ============================
ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS experience_years SMALLINT;
ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS teaching_levels JSON;
ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS teaching_methods JSON;
ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS teaching_video_url TEXT;

-- ============================ DOWN ============================
-- Xóa dữ liệu tự khai báo. KHÔNG đụng các cột có sẵn (bio, website_url...).
ALTER TABLE instructor_profiles DROP COLUMN IF EXISTS teaching_video_url;
ALTER TABLE instructor_profiles DROP COLUMN IF EXISTS teaching_methods;
ALTER TABLE instructor_profiles DROP COLUMN IF EXISTS teaching_levels;
ALTER TABLE instructor_profiles DROP COLUMN IF EXISTS experience_years;
