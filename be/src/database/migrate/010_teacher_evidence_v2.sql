-- 010 — Teacher evidence v2 (verified / inferred / declared)
--
-- UP   : được áp dụng tự động mỗi khi app boot (src/database/init-db.ts, khối
--        "BEGIN: Teacher evidence v2"). File này là bản sao canonical để
--        replay thủ công: psql -f 010_teacher_evidence_v2.sql (chỉ phần UP).
-- DOWN : rollback thủ công — cắt phần DOWN ra chạy riêng.
--
-- Quy tắc:
--   * Chứng chỉ đã duyệt = bằng chứng NGÔN NGỮ đã XÁC MINH. Chứng chỉ ngôn
--     ngữ KHÔNG suy ra năng lực sư phạm; giảng viên tự khai không tính điểm.
--   * Bảng mã mới: language (grammar, vocabulary, listening, speaking,
--     reading, writing, pronunciation), exam (ielts, toeic, toefl),
--     pedagogy (instructional_clarity, student_engagement).
--   * `weight` snapshot mới = baseWeight(source) × tier (VERIFIED 1.0,
--     INFERRED 0.5, DECLARED 0). Evidence cũ bị SUPERSEDED để extractor
--     dựng lại theo đúng phân loại/trọng số (audit trail vẫn giữ nguyên).
--   * OCR của chứng chỉ được copy sang `instructor_certificates` lúc duyệt;
--     migration backfill cho các chứng chỉ đã duyệt trước đó.

-- ============================ UP ============================

ALTER TYPE skill_category_enum ADD VALUE IF NOT EXISTS 'LANGUAGE';
ALTER TYPE skill_category_enum ADD VALUE IF NOT EXISTS 'EXAM';

-- Đổi mã cũ *_teaching -> mã chung (an toàn: FK chỉ trỏ skill_id).
UPDATE instructor_skills SET code = 'grammar', name = 'Grammar' WHERE code = 'grammar_teaching';
UPDATE instructor_skills SET code = 'vocabulary', name = 'Vocabulary' WHERE code = 'vocabulary_teaching';
UPDATE instructor_skills SET code = 'speaking', name = 'Speaking' WHERE code = 'speaking_teaching';
UPDATE instructor_skills SET code = 'listening', name = 'Listening' WHERE code = 'listening_teaching';
UPDATE instructor_skills SET code = 'writing', name = 'Writing' WHERE code = 'writing_teaching';
UPDATE instructor_skills SET code = 'pronunciation', name = 'Pronunciation' WHERE code = 'pronunciation_teaching';

UPDATE instructor_skills
SET category = 'LANGUAGE'
WHERE code IN ('grammar', 'vocabulary', 'speaking', 'listening', 'writing', 'pronunciation');

INSERT INTO instructor_skills (code, name, category, description, display_order, is_active)
VALUES
  ('reading', 'Reading', 'LANGUAGE', 'Reading comprehension', 7, TRUE),
  ('ielts', 'IELTS', 'EXAM', 'IELTS certificate', 8, TRUE),
  ('toeic', 'TOEIC', 'EXAM', 'TOEIC certificate', 9, TRUE),
  ('toefl', 'TOEFL', 'EXAM', 'TOEFL certificate', 10, TRUE)
ON CONFLICT (code) DO NOTHING;

UPDATE instructor_skills
SET display_order = CASE code
  WHEN 'grammar' THEN 1
  WHEN 'vocabulary' THEN 2
  WHEN 'speaking' THEN 3
  WHEN 'listening' THEN 4
  WHEN 'writing' THEN 5
  WHEN 'pronunciation' THEN 6
  WHEN 'reading' THEN 7
  WHEN 'ielts' THEN 8
  WHEN 'toeic' THEN 9
  WHEN 'toefl' THEN 10
  WHEN 'instructional_clarity' THEN 11
  WHEN 'student_engagement' THEN 12
  ELSE display_order
END
WHERE code IN (
  'grammar', 'vocabulary', 'speaking', 'listening', 'writing', 'pronunciation',
  'reading', 'ielts', 'toeic', 'toefl', 'instructional_clarity', 'student_engagement'
);

ALTER TABLE instructor_skill_profiles
  ADD COLUMN IF NOT EXISTS verified_ratio NUMERIC(4,3) NOT NULL DEFAULT 0
  CHECK (verified_ratio BETWEEN 0 AND 1);

ALTER TABLE instructor_skill_evidences
  ADD COLUMN IF NOT EXISTS verification VARCHAR(10) NOT NULL DEFAULT 'INFERRED';
ALTER TABLE instructor_skill_evidences
  ADD COLUMN IF NOT EXISTS capability VARCHAR(20) NOT NULL DEFAULT 'TEACHING';
CREATE INDEX IF NOT EXISTS idx_instructor_skill_evidences_verification
  ON instructor_skill_evidences(verification);

-- Bằng chứng cũ bị dựng lại theo phân loại mới (giữ lịch sử, không xóa).
UPDATE instructor_skill_evidences
SET status = 'SUPERSEDED'
WHERE status = 'ACTIVE' AND (metadata ->> 'extracted') = 'true';

-- Tự khai: DECLARED, không tham gia score.
UPDATE instructor_skill_evidences
SET verification = 'DECLARED', weight = 0
WHERE source_type = 'SELF_ASSESSMENT'
  AND (metadata ->> 'extracted') IS DISTINCT FROM 'true';

ALTER TABLE instructor_certificates
  ADD COLUMN IF NOT EXISTS ocr_status VARCHAR(20);
ALTER TABLE instructor_certificates
  ADD COLUMN IF NOT EXISTS ocr_raw_text TEXT;
ALTER TABLE instructor_certificates
  ADD COLUMN IF NOT EXISTS ocr_extracted_data JSONB;

-- Backfill OCR cho chứng chỉ đã duyệt trước khi có cột copy.
UPDATE instructor_certificates ic
SET ocr_raw_text = ac.ocr_raw_text,
    ocr_extracted_data = ac.ocr_extracted_data,
    ocr_status = ac.ocr_status
FROM instructor_applications ia
JOIN instructor_application_certificates ac ON ac.application_id = ia.id
WHERE ic.user_id = ia.user_id
  AND ic.certificate_name = ac.certificate_name
  AND ic.issued_at IS NOT DISTINCT FROM ac.issued_at
  AND ic.ocr_extracted_data IS NULL
  AND ac.ocr_extracted_data IS NOT NULL;

-- ============================ DOWN ============================
-- Chạy tay khi rollback. Không thể xóa giá trị enum trong Postgres.

-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS ocr_extracted_data;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS ocr_raw_text;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS ocr_status;
-- DROP INDEX IF EXISTS idx_instructor_skill_evidences_verification;
-- ALTER TABLE instructor_skill_evidences DROP COLUMN IF EXISTS capability;
-- ALTER TABLE instructor_skill_evidences DROP COLUMN IF EXISTS verification;
-- ALTER TABLE instructor_skill_profiles DROP COLUMN IF EXISTS verified_ratio;
-- UPDATE instructor_skills SET code = code || '_teaching'
--   WHERE code IN ('grammar','vocabulary','speaking','listening','writing','pronunciation');
-- DELETE FROM instructor_skills WHERE code IN ('reading','ielts','toeic','toefl');
