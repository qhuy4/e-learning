-- 012 — Quiz từ vựng (cloze 30 câu) + tự đánh giá cho skill match 3 bước.
-- Canonical replay cho init-db.ts (bootstrap idempotent).

CREATE TABLE IF NOT EXISTS student_quiz_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  form_seed BIGINT NOT NULL,
  item_count INT NOT NULL,
  raw_score INT NOT NULL,
  band VARCHAR(8),
  band_source VARCHAR(16),
  provisional_band VARCHAR(8),
  theta NUMERIC(8,4),
  se NUMERIC(8,4),
  calibrated BOOLEAN,
  per_band JSONB,
  responses JSONB,
  raw JSONB,
  model_version VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_quiz_attempts_user_created
  ON student_quiz_attempts (user_id, created_at DESC);

-- Sửa width cho DB đã tạo từ bản nháp trước đó (idempotent; replay an toàn).
ALTER TABLE student_quiz_attempts ALTER COLUMN band TYPE VARCHAR(8);
ALTER TABLE student_quiz_attempts ALTER COLUMN provisional_band TYPE VARCHAR(8);
ALTER TABLE student_quiz_attempts ALTER COLUMN theta TYPE NUMERIC(8,4);
ALTER TABLE student_quiz_attempts ALTER COLUMN se TYPE NUMERIC(8,4);

CREATE TABLE IF NOT EXISTS student_self_assessments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  band VARCHAR(8) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_self_assessments_user_created
  ON student_self_assessments (user_id, created_at DESC);
