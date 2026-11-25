BEGIN;

ALTER TABLE student_speaking_attempts
  ADD COLUMN IF NOT EXISTS assessment_status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS grammar_score INT,
  ADD COLUMN IF NOT EXISTS vocabulary_score INT,
  ADD COLUMN IF NOT EXISTS fluency_score INT,
  ADD COLUMN IF NOT EXISTS overall_score INT,
  ADD COLUMN IF NOT EXISTS assessment_feedback JSONB,
  ADD COLUMN IF NOT EXISTS assessment_model VARCHAR(100),
  ADD COLUMN IF NOT EXISTS assessment_error VARCHAR(255);

COMMIT;
