-- 014 — Listening MVP cho learner profile / skill match.

CREATE TABLE IF NOT EXISTS student_listening_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answered_count INT NOT NULL,
  total_items INT NOT NULL,
  raw_score INT NOT NULL,
  score_pct INT NOT NULL,
  responses JSONB NOT NULL,
  form_version VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_listening_attempts_user_created
  ON student_listening_attempts (user_id, created_at DESC);
