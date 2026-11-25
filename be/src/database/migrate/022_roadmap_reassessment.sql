CREATE TABLE IF NOT EXISTS roadmap_reassessments (
  id BIGSERIAL PRIMARY KEY,
  roadmap_id BIGINT NOT NULL REFERENCES learning_roadmaps(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  previous_level VARCHAR(8) NOT NULL,
  assessed_level VARCHAR(8) NOT NULL,
  profile_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  decision JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roadmap_reassessments_roadmap
  ON roadmap_reassessments(roadmap_id, created_at DESC);
