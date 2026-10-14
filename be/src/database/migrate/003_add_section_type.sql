-- ============================================================
-- 003 — Thêm cột section_type (LISTENING / READING / WRITING / SPEAKING)
--   bảng exam_format_sections (nguồn) + exam_sections (khi gen đề).
-- Idempotent: chạy lại bao nhiêu lần cũng được (ADD COLUMN IF NOT EXISTS).
-- ============================================================

-- 1) Thêm cột (nếu chưa có)
ALTER TABLE exam_format_sections ADD COLUMN IF NOT EXISTS section_type VARCHAR(20);
ALTER TABLE exam_sections        ADD COLUMN IF NOT EXISTS section_type VARCHAR(20);

-- 2) Backfill exam_format_sections cho dữ liệu cũ — đoán từ TÊN section
UPDATE exam_format_sections
SET section_type = CASE
  WHEN name ~* 'listening'       THEN 'LISTENING'
  WHEN name ~* 'reading'         THEN 'READING'
  WHEN name ~* 'writing'         THEN 'WRITING'
  WHEN name ~* 'speaking'        THEN 'SPEAKING'
  WHEN name ~* '^part *[1-4]([^0-9]|$)' THEN 'LISTENING'   -- TOEIC Part 1–4 = Nghe
  WHEN name ~* '^part *[5-7]([^0-9]|$)' THEN 'READING'     -- TOEIC Part 5–7 = Đọc
  WHEN name ~* 'nghe'            THEN 'LISTENING'   -- "Nghe hiểu"
  WHEN name ~* 'đọc'             THEN 'READING'     -- "Đọc hiểu"
  ELSE section_type                                  -- giữ nguyên nếu đã có giá trị
END
WHERE section_type IS NULL;

-- 3) Backfill exam_sections: ưu tiên KẾ THỪA từ format section (nguồn sự
--    thật); không có format link → đoán từ tên (dữ liệu cũ).
UPDATE exam_sections es
SET section_type = COALESCE(
  (SELECT efs.section_type
     FROM exam_format_sections efs
    WHERE efs.id = es.format_section_id),
  CASE
    WHEN es.name ~* 'listening'       THEN 'LISTENING'
    WHEN es.name ~* 'reading'         THEN 'READING'
    WHEN es.name ~* 'writing'         THEN 'WRITING'
    WHEN es.name ~* 'speaking'        THEN 'SPEAKING'
    WHEN es.name ~* '^part *[1-4]([^0-9]|$)' THEN 'LISTENING'
    WHEN es.name ~* '^part *[5-7]([^0-9]|$)' THEN 'READING'
    WHEN es.name ~* 'nghe'            THEN 'LISTENING'
    WHEN es.name ~* 'đọc'             THEN 'READING'
    ELSE es.section_type
  END)
WHERE es.section_type IS NULL;

-- 4) (TÙY CHỌN) ràng buộc giá trị hợp lệ
ALTER TABLE exam_format_sections DROP CONSTRAINT IF EXISTS chk_exam_format_sections_section_type;
ALTER TABLE exam_format_sections ADD CONSTRAINT chk_exam_format_sections_section_type
  CHECK (section_type IS NULL OR section_type IN ('LISTENING', 'READING', 'WRITING', 'SPEAKING'));

ALTER TABLE exam_sections DROP CONSTRAINT IF EXISTS chk_exam_sections_section_type;
ALTER TABLE exam_sections ADD CONSTRAINT chk_exam_sections_section_type
  CHECK (section_type IS NULL OR section_type IN ('LISTENING', 'READING', 'WRITING', 'SPEAKING'));

-- 5) Kiểm tra
SELECT f.name AS format, s.position, s.name, s.section_type
  FROM exam_format_sections s
  JOIN exam_formats f ON f.id = s.exam_format_id
 ORDER BY f.id, s.position;

SELECT e.id, e.title, s.position, s.name, s.section_type
  FROM exam_sections s
  JOIN exams e ON e.id = s.exam_id
 ORDER BY e.id, s.position;
