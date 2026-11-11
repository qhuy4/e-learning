-- Instructor-defined hourly fee for paid 1:1 sessions.
ALTER TABLE instructor_profiles
  ADD COLUMN IF NOT EXISTS hourly_rate numeric(12, 2) NOT NULL DEFAULT 0;
