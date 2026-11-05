-- 011 — Evidence-driven skill assessment runs and explicit assessment states.
-- Canonical replay for the idempotent bootstrap in init-db.ts.

ALTER TABLE instructor_skill_profiles ALTER COLUMN score DROP NOT NULL;
ALTER TABLE instructor_skill_profiles ALTER COLUMN confidence DROP NOT NULL;
ALTER TABLE instructor_skill_profiles
  ADD COLUMN IF NOT EXISTS assessment_status VARCHAR(30) NOT NULL DEFAULT 'PROVISIONAL';
ALTER TABLE instructor_skill_profiles
  ADD COLUMN IF NOT EXISTS independent_evidence_count INT NOT NULL DEFAULT 0;
ALTER TABLE instructor_skill_profiles ADD COLUMN IF NOT EXISTS current_run_id BIGINT;

CREATE TABLE IF NOT EXISTS skill_assessment_runs (
  id BIGSERIAL PRIMARY KEY,
  instructor_id BIGINT NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
  trigger_type VARCHAR(30) NOT NULL,
  processing_status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING',
  algorithm_version VARCHAR(30) NOT NULL,
  input_hash VARCHAR(64),
  affected_skill_ids BIGINT[],
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_skill_assessment_runs_instructor_id
  ON skill_assessment_runs(instructor_id, id DESC);

CREATE TABLE IF NOT EXISTS skill_assessment_results (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES skill_assessment_runs(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES instructor_skills(id) ON DELETE RESTRICT,
  score NUMERIC(4,3) CHECK (score BETWEEN 0 AND 1),
  confidence NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
  assessment_status VARCHAR(30) NOT NULL,
  evidence_count INT NOT NULL DEFAULT 0,
  independent_evidence_count INT NOT NULL DEFAULT 0,
  verified_ratio NUMERIC(4,3) NOT NULL DEFAULT 0,
  explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(run_id, skill_id)
);

CREATE TABLE IF NOT EXISTS skill_assessment_evidence_snapshots (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES skill_assessment_runs(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES instructor_skills(id) ON DELETE RESTRICT,
  evidence_id BIGINT REFERENCES instructor_skill_evidences(id) ON DELETE SET NULL,
  source_type VARCHAR(40) NOT NULL,
  source_id VARCHAR(100),
  independence_key VARCHAR(180) NOT NULL,
  eligible BOOLEAN NOT NULL,
  exclusion_reason VARCHAR(100),
  normalized_score NUMERIC(4,3),
  effective_weight NUMERIC(10,6),
  contribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_skill_assessment_snapshots_run_skill
  ON skill_assessment_evidence_snapshots(run_id, skill_id);

CREATE TABLE IF NOT EXISTS skill_recommendations (
  id BIGSERIAL PRIMARY KEY,
  instructor_id BIGINT NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES instructor_skills(id) ON DELETE RESTRICT,
  recommendation_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  rationale TEXT NOT NULL,
  created_by_run_id BIGINT REFERENCES skill_assessment_runs(id) ON DELETE SET NULL,
  completed_at TIMESTAMP,
  dismissed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_skill_recommendations_active_gap
  ON skill_recommendations(instructor_id, skill_id, recommendation_type)
  WHERE status = 'ACTIVE';
