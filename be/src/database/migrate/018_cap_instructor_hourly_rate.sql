ALTER TABLE instructor_profiles
  DROP CONSTRAINT IF EXISTS chk_instructor_profiles_hourly_rate;

ALTER TABLE instructor_profiles
  ADD CONSTRAINT chk_instructor_profiles_hourly_rate
  CHECK (hourly_rate >= 0 AND hourly_rate <= 1000000);
