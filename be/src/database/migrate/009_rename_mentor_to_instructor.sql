-- 009: Rename mentor/teacher workflow names to instructor in-place.
-- Preserves IDs, rows, foreign keys, and history. Safe to replay.

-- ============================ UP ============================

DO $$
BEGIN
  IF to_regclass('public.mentor_applications') IS NOT NULL THEN
    IF to_regclass('public.instructor_applications') IS NOT NULL THEN
      RAISE EXCEPTION 'Both mentor_applications and instructor_applications exist';
    END IF;
    ALTER TABLE public.mentor_applications RENAME TO instructor_applications;
  END IF;

  IF to_regclass('public.mentor_tokens') IS NOT NULL THEN
    IF to_regclass('public.instructor_application_tokens') IS NOT NULL THEN
      RAISE EXCEPTION 'Both mentor_tokens and instructor_application_tokens exist';
    END IF;
    ALTER TABLE public.mentor_tokens RENAME TO instructor_application_tokens;
  END IF;

  IF to_regclass('public.mentor_application_certificates') IS NOT NULL THEN
    IF to_regclass('public.instructor_application_certificates') IS NOT NULL THEN
      RAISE EXCEPTION 'Both mentor_application_certificates and instructor_application_certificates exist';
    END IF;
    ALTER TABLE public.mentor_application_certificates RENAME TO instructor_application_certificates;
  END IF;

  IF to_regclass('public.teacher_availability_recurring') IS NOT NULL THEN
    IF to_regclass('public.instructor_availability_recurring') IS NOT NULL THEN
      RAISE EXCEPTION 'Both teacher_availability_recurring and instructor_availability_recurring exist';
    END IF;
    ALTER TABLE public.teacher_availability_recurring RENAME TO instructor_availability_recurring;
  END IF;

  IF to_regclass('public.teacher_availability_exceptions') IS NOT NULL THEN
    IF to_regclass('public.instructor_availability_exceptions') IS NOT NULL THEN
      RAISE EXCEPTION 'Both teacher_availability_exceptions and instructor_availability_exceptions exist';
    END IF;
    ALTER TABLE public.teacher_availability_exceptions RENAME TO instructor_availability_exceptions;
  END IF;
END $$;

-- Rename serial sequences so future inserts keep clean names.
DO $$
DECLARE
  pair record;
BEGIN
  FOR pair IN
    SELECT * FROM (VALUES
      ('mentor_applications_id_seq', 'instructor_applications_id_seq'),
      ('mentor_tokens_id_seq', 'instructor_application_tokens_id_seq'),
      ('mentor_application_certificates_id_seq', 'instructor_application_certificates_id_seq'),
      ('teacher_availability_recurring_id_seq', 'instructor_availability_recurring_id_seq'),
      ('teacher_availability_exceptions_id_seq', 'instructor_availability_exceptions_id_seq')
    ) AS v(old_name, new_name)
  LOOP
    IF to_regclass('public.' || pair.old_name) IS NOT NULL
       AND to_regclass('public.' || pair.new_name) IS NULL THEN
      EXECUTE format('ALTER SEQUENCE public.%I RENAME TO %I', pair.old_name, pair.new_name);
    END IF;
  END LOOP;
END $$;

-- Rename constraints and indexes that still carry the old names.
DO $$
DECLARE
  item record;
  renamed text;
BEGIN
  FOR item IN
    SELECT conname, conrelid::regclass::text AS tbl
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
      AND (conname LIKE '%mentor%' OR conname LIKE '%teacher_availability%')
  LOOP
    renamed := replace(
      replace(
        replace(
          replace(item.conname,
            'mentor_application_certificates', 'instructor_application_certificates'),
          'mentor_applications', 'instructor_applications'),
        'mentor_tokens', 'instructor_application_tokens'),
      'teacher_availability', 'instructor_availability');
    renamed := replace(renamed, 'mentor_', 'instructor_');

    IF item.conname LIKE 'chk_mentor_token_purpose%' THEN
      renamed := 'chk_instructor_application_token_purpose';
    ELSIF item.conname LIKE 'chk_mentor_certificate_status%' THEN
      renamed := 'chk_instructor_application_certificate_status';
    END IF;

    IF renamed <> item.conname THEN
      EXECUTE format('ALTER TABLE %s RENAME CONSTRAINT %I TO %I', item.tbl, item.conname, renamed);
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE
  item record;
  renamed text;
BEGIN
  FOR item IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND (indexname LIKE '%mentor%' OR indexname LIKE '%teacher_availability%')
  LOOP
    renamed := replace(
      replace(
        replace(
          replace(item.indexname,
            'mentor_application_certificates', 'instructor_application_certificates'),
          'mentor_applications', 'instructor_applications'),
        'mentor_tokens', 'instructor_application_tokens'),
      'teacher_availability', 'instructor_availability');
    renamed := replace(renamed, 'mentor_', 'instructor_');

    IF renamed <> item.indexname THEN
      EXECUTE format('ALTER INDEX public.%I RENAME TO %I', item.indexname, renamed);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  -- to_regclass thay ::regclass: an toàn khi bảng chưa tồn tại (init-db tạo sau).
  IF to_regclass('public.instructor_applications') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conname = 'instructor_applications_user_id_fkey'
         AND conrelid = to_regclass('public.instructor_applications')
     ) THEN
    ALTER TABLE public.instructor_applications
      ADD CONSTRAINT instructor_applications_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.email_outbox') IS NOT NULL THEN
    UPDATE email_outbox
      SET template = replace(template, 'MENTOR_', 'INSTRUCTOR_')
      WHERE template LIKE 'MENTOR_%';
  END IF;
END $$;

-- ============================ DOWN ============================
-- Rename back manually if rollback is required:
-- ALTER TABLE instructor_applications RENAME TO mentor_applications;
-- ALTER TABLE instructor_application_tokens RENAME TO mentor_tokens;
-- ALTER TABLE instructor_application_certificates RENAME TO mentor_application_certificates;
-- ALTER TABLE instructor_availability_recurring RENAME TO teacher_availability_recurring;
-- ALTER TABLE instructor_availability_exceptions RENAME TO teacher_availability_exceptions;
