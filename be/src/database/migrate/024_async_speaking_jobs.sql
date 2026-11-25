ALTER TABLE student_speaking_attempts
  ADD COLUMN IF NOT EXISTS processing_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_student_speaking_attempts_queue
  ON student_speaking_attempts (next_attempt_at, id)
  WHERE transcription_status = 'PROCESSING'
     OR (transcription_status = 'COMPLETED'
         AND assessment_status IN ('PENDING', 'PROCESSING'));
