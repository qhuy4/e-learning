-- 005 — Instructor Skill Profiling (3 bảng mới + seed catalog)
--
-- UP   : được áp dụng tự động mỗi khi app boot (src/database/init-db.ts,
--        khối "BEGIN: Instructor Skill Profiling"). File này là bản sao
--        canonical để replay thủ công:  psql -f 005_instructor_skill_profiling.sql
--        (chỉ chạy phần UP).
-- DOWN : rollback thủ công — cắt phần DOWN ra chạy riêng:
--        psql -c "\i <(sed -n '/-- DOWN/,$p' 005_...)"  (hoặc copy tay).
--
-- Quy tắc:
--   * instructor_skills là catalog — seed ON CONFLICT (code) DO NOTHING,
--     chạy lại nhiều lần không nhân bản, không ghi đè chỉnh sửa tay.
--   * instructor_skill_profiles = kết quả hiện tại; matching chỉ đọc bảng này;
--     không có evidence => không có dòng (unknown ≠ 0).
--   * instructor_skill_evidences = append-only: chỉ INSERT + flip status;
--     UNIQUE một phần WHERE status='ACTIVE' cho phép thay thế cùng version
--     mà vẫn giữ lịch sử SUPERSEDED.
--   * FK instructor_id: CASCADE (xóa instructor thì xóa dữ liệu kèm theo);
--     FK skill_id: RESTRICT (muốn ẩn skill dùng is_active=false, không xóa).

-- ============================ UP ============================

DO $$ BEGIN
  CREATE TYPE skill_category_enum AS ENUM ('SUBJECT', 'PEDAGOGY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE skill_source_type_enum AS ENUM
    ('SELF_ASSESSMENT', 'EXPERIENCE', 'LESSON_PLAN', 'CERTIFICATE', 'STUDENT_RATING', 'STUDENT_OUTCOME');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE skill_evidence_status_enum AS ENUM ('ACTIVE', 'SUPERSEDED', 'REVOKED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS instructor_skills (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category skill_category_enum NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instructor_skill_profiles (
  id BIGSERIAL PRIMARY KEY,
  instructor_id BIGINT NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES instructor_skills(id) ON DELETE RESTRICT,
  score NUMERIC(4,3) NOT NULL CHECK (score BETWEEN 0 AND 1),
  confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  evidence_count INT NOT NULL DEFAULT 0,
  model_version VARCHAR(30) NOT NULL,
  computed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_skill_profiles_instructor_skill
  ON instructor_skill_profiles(instructor_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_instructor_skill_profiles_skill_score_desc
  ON instructor_skill_profiles(skill_id, score DESC);

CREATE TABLE IF NOT EXISTS instructor_skill_evidences (
  id BIGSERIAL PRIMARY KEY,
  instructor_id BIGINT NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES instructor_skills(id) ON DELETE RESTRICT,
  source_type skill_source_type_enum NOT NULL,
  source_id VARCHAR(100),
  score NUMERIC(4,3) NOT NULL CHECK (score BETWEEN 0 AND 1),
  weight NUMERIC(5,4) NOT NULL CHECK (weight >= 0),
  confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  observed_at TIMESTAMP NOT NULL,
  extractor_version VARCHAR(30) NOT NULL,
  status skill_evidence_status_enum NOT NULL DEFAULT 'ACTIVE',
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Chỉ các dòng ACTIVE được kín khóa: SUPERSEDED giữ lịch sử, vẫn cho
-- thay thế cùng version. Dòng source_id IS NULL cần index riêng (NULL ≠ NULL).
CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_skill_evidences_active
  ON instructor_skill_evidences(instructor_id, skill_id, source_type, source_id, extractor_version)
  WHERE status = 'ACTIVE';
CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_skill_evidences_null_source_active
  ON instructor_skill_evidences(instructor_id, skill_id, source_type, extractor_version)
  WHERE source_id IS NULL AND status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_instructor_skill_evidences_instructor_skill_status
  ON instructor_skill_evidences(instructor_id, skill_id, status);
CREATE INDEX IF NOT EXISTS idx_instructor_skill_evidences_source_type_id
  ON instructor_skill_evidences(source_type, source_id);

-- Seed catalog 8 dòng — idempotent
INSERT INTO instructor_skills (code, name, category, description, display_order, is_active) VALUES
  ('grammar_teaching', 'Grammar Teaching', 'SUBJECT', 'Teaching English grammar rules and structures', 1, TRUE),
  ('vocabulary_teaching', 'Vocabulary Teaching', 'SUBJECT', 'Teaching English vocabulary and word usage', 2, TRUE),
  ('speaking_teaching', 'Speaking Teaching', 'SUBJECT', 'Teaching English speaking skills and fluency', 3, TRUE),
  ('listening_teaching', 'Listening Teaching', 'SUBJECT', 'Teaching English listening comprehension', 4, TRUE),
  ('writing_teaching', 'Writing Teaching', 'SUBJECT', 'Teaching English writing skills and composition', 5, TRUE),
  ('pronunciation_teaching', 'Pronunciation Teaching', 'SUBJECT', 'Teaching English pronunciation and phonetics', 6, TRUE),
  ('instructional_clarity', 'Instructional Clarity', 'PEDAGOGY', 'Clarity and effectiveness of teaching explanations', 7, TRUE),
  ('student_engagement', 'Student Engagement', 'PEDAGOGY', 'Ability to engage and motivate students in learning', 8, TRUE)
ON CONFLICT (code) DO NOTHING;

-- ============================ DOWN ============================
-- Chạy tay khi rollback. Thứ tự theo FK (evidence -> profile -> skill -> enum).
-- KHÔNG đụng instructor_certificates / instructor_profiles.

-- DROP TABLE IF EXISTS instructor_skill_evidences;
-- DROP TABLE IF EXISTS instructor_skill_profiles;
-- DROP TABLE IF EXISTS instructor_skills;
-- DROP TYPE IF EXISTS skill_evidence_status_enum;
-- DROP TYPE IF EXISTS skill_source_type_enum;
-- DROP TYPE IF EXISTS skill_category_enum;
