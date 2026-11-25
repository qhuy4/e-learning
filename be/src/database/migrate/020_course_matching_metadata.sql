ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS cefr_level_start VARCHAR(8),
  ADD COLUMN IF NOT EXISTS cefr_level_end VARCHAR(8),
  ADD COLUMN IF NOT EXISTS skill_codes JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE courses
SET cefr_level_start = CASE level WHEN 1 THEN 'A1' WHEN 2 THEN 'B1' WHEN 3 THEN 'C1' END,
    cefr_level_end = CASE level WHEN 1 THEN 'A2' WHEN 2 THEN 'B2' WHEN 3 THEN 'C2' END
WHERE cefr_level_start IS NULL OR cefr_level_end IS NULL;

-- Chỉ backfill kỹ năng khi nội dung khóa học hiện tại nêu rõ; không suy diễn cho dữ liệu test.
UPDATE courses SET skill_codes = '["speaking","pronunciation","vocabulary"]'::jsonb
WHERE title = 'Tiếng Anh Giao Tiếp Cho Người Mới Bắt Đầu' AND skill_codes = '[]'::jsonb;
UPDATE courses SET skill_codes = '["grammar"]'::jsonb
WHERE title = 'Ngữ Pháp Tiếng Anh Căn Bản' AND skill_codes = '[]'::jsonb;

ALTER TABLE courses DROP CONSTRAINT IF EXISTS chk_courses_cefr_range;
ALTER TABLE courses ADD CONSTRAINT chk_courses_cefr_range CHECK (
  (cefr_level_start IS NULL OR cefr_level_start IN ('A1','A2','B1','B2','C1','C2'))
  AND (cefr_level_end IS NULL OR cefr_level_end IN ('A1','A2','B1','B2','C1','C2'))
  AND (
    cefr_level_start IS NULL OR cefr_level_end IS NULL OR
    array_position(ARRAY['A1','A2','B1','B2','C1','C2'], cefr_level_start)
      <= array_position(ARRAY['A1','A2','B1','B2','C1','C2'], cefr_level_end)
  )
);
