ALTER TABLE learning_roadmap_stages
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

UPDATE learning_roadmap_stages
SET started_at = COALESCE(started_at, updated_at),
    completed_at = COALESCE(completed_at, updated_at)
WHERE status = 'COMPLETED';

UPDATE learning_roadmap_stages
SET started_at = COALESCE(started_at, updated_at)
WHERE status = 'IN_PROGRESS';
