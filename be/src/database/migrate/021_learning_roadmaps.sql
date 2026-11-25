CREATE TABLE IF NOT EXISTS learning_roadmaps (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_level VARCHAR(8) NOT NULL,
  target_level VARCHAR(8) NOT NULL DEFAULT 'B2',
  status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
  revision INT NOT NULL DEFAULT 1,
  profile_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_learning_roadmap_status CHECK (status IN ('ACTIVE','SUPERSEDED','COMPLETED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_learning_roadmaps_active_user
  ON learning_roadmaps(user_id) WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS learning_roadmap_stages (
  id BIGSERIAL PRIMARY KEY,
  roadmap_id BIGINT NOT NULL REFERENCES learning_roadmaps(id) ON DELETE CASCADE,
  position INT NOT NULL,
  from_level VARCHAR(8) NOT NULL,
  to_level VARCHAR(8) NOT NULL,
  course_id BIGINT REFERENCES courses(id) ON DELETE SET NULL,
  instructor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
  rationale JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(roadmap_id, position),
  CONSTRAINT chk_learning_roadmap_stage_status CHECK (
    status IN ('PENDING','IN_PROGRESS','COMPLETED','SKIPPED')
  )
);

CREATE INDEX IF NOT EXISTS idx_learning_roadmap_stages_roadmap
  ON learning_roadmap_stages(roadmap_id, position);
