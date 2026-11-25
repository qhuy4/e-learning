BEGIN;

CREATE TABLE IF NOT EXISTS student_speaking_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id VARCHAR(40) NOT NULL,
  level VARCHAR(8) NOT NULL,
  duration_seconds INT NOT NULL,
  audio_key VARCHAR(500) NOT NULL,
  audio_mime_type VARCHAR(100) NOT NULL,
  audio_size INT NOT NULL,
  transcript TEXT,
  transcription_status VARCHAR(16) NOT NULL,
  transcription_model VARCHAR(80),
  transcription_error VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_speaking_attempts_user_created
  ON student_speaking_attempts (user_id, created_at DESC);

COMMIT;
