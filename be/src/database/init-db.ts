import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { renameLegacyInstructorTables } from './rename-legacy-instructor-tables';

export async function initDatabaseTables(dataSource: DataSource) {
  const logger = new Logger('InitDatabase');
  try {
    await renameLegacyInstructorTables(dataSource);

    // 1. Tạo bảng instructor_profiles nếu chưa có
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS instructor_profiles (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        headline VARCHAR(200),
        bio TEXT,
        website_url TEXT,
        social_links JSON,
        revenue_share_pct NUMERIC(5,2) DEFAULT 70,
        total_earned NUMERIC(14,2) DEFAULT 0,
        pending_payout NUMERIC(14,2) DEFAULT 0,
        approval_status SMALLINT DEFAULT 1,
        approved_at TIMESTAMP,
        total_students INT DEFAULT 0,
        avg_rating NUMERIC(3,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_instructor_profiles_user_id ON instructor_profiles(user_id);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_profiles_user_id ON instructor_profiles(user_id);
      ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS review_reason TEXT;
      ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(12, 2) NOT NULL DEFAULT 0;
    `);

    // 3. Tạo bảng instructor_certificates nếu chưa có
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS instructor_certificates (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        certificate_name VARCHAR(255) NOT NULL,
        issuer VARCHAR(255),
        file_path VARCHAR(500) NOT NULL,
        issued_at DATE,
        expires_at DATE,
        certificate_status SMALLINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_instructor_certificates_user_id ON instructor_certificates(user_id);
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS file_key VARCHAR(500);
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS file_size BIGINT;
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS tags JSONB;
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS reviewed_by BIGINT;
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS reject_reason TEXT;
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
      -- created_at/updated_at của bảng này đã tồn tại từ trước (không còn
      -- chạy lại CREATE) nên DEFAULT trong CREATE không áp dụng → thêm tường
      -- minh + backfill row cũ (NULL → extractor sinh observed_at = epoch).
      ALTER TABLE instructor_certificates ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE instructor_certificates ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
      UPDATE instructor_certificates
      SET created_at = COALESCE(issued_at::timestamp, reviewed_at, NOW())
      WHERE created_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_instructor_certificates_tags ON instructor_certificates USING GIN (tags);
    `);

    // 4.1 Instructor application workflow
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS instructor_applications (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        headline VARCHAR(200),
        bio TEXT,
        website_url TEXT,
        social_links JSON,
        status VARCHAR(32) NOT NULL DEFAULT 'PENDING_SUBMISSION',
        review_reason TEXT,
        reviewed_by BIGINT,
        reviewed_at TIMESTAMPTZ,
        user_id BIGINT,
        submitted_at TIMESTAMPTZ,
        activated_at TIMESTAMPTZ,
        requires_password BOOLEAN NOT NULL DEFAULT FALSE,
        version INT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_instructor_application_status CHECK (
          status IN ('PENDING_SUBMISSION', 'PENDING_INFORMATION', 'PENDING_REVIEW', 'APPROVED', 'REJECTED')
        )
      );
      CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_applications_email_lower
        ON instructor_applications (LOWER(email));
      CREATE INDEX IF NOT EXISTS idx_instructor_applications_status ON instructor_applications(status);
      CREATE INDEX IF NOT EXISTS idx_instructor_applications_user_id ON instructor_applications(user_id);
      ALTER TABLE instructor_applications
        ALTER COLUMN status SET DEFAULT 'PENDING_SUBMISSION';
      ALTER TABLE instructor_applications
        DROP CONSTRAINT IF EXISTS chk_instructor_application_status;
      UPDATE instructor_applications
        SET status = 'PENDING_SUBMISSION'
        WHERE status = 'PENDING_INFORMATION' AND submitted_at IS NULL;
      ALTER TABLE instructor_applications
        ADD CONSTRAINT chk_instructor_application_status CHECK (
          status IN ('PENDING_SUBMISSION', 'PENDING_INFORMATION', 'PENDING_REVIEW', 'APPROVED', 'REJECTED')
        );

      CREATE TABLE IF NOT EXISTS instructor_application_tokens (
        id BIGSERIAL PRIMARY KEY,
        application_id BIGINT NOT NULL REFERENCES instructor_applications(id) ON DELETE CASCADE,
        user_id BIGINT,
        purpose VARCHAR(20) NOT NULL,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_instructor_application_token_purpose CHECK (purpose IN ('APPLICATION', 'ACTIVATION'))
      );
      CREATE INDEX IF NOT EXISTS idx_instructor_application_tokens_application_id ON instructor_application_tokens(application_id);
      CREATE INDEX IF NOT EXISTS idx_instructor_application_tokens_purpose ON instructor_application_tokens(purpose);

      CREATE TABLE IF NOT EXISTS instructor_application_certificates (
        id BIGSERIAL PRIMARY KEY,
        application_id BIGINT NOT NULL REFERENCES instructor_applications(id) ON DELETE CASCADE,
        certificate_name VARCHAR(255) NOT NULL,
        issuer VARCHAR(255),
        issued_at DATE,
        expires_at DATE,
        file_key VARCHAR(500),
        legacy_file_path VARCHAR(500),
        file_name VARCHAR(255),
        mime_type VARCHAR(100),
        file_size BIGINT,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        tags JSONB,
        reviewed_by BIGINT,
        reviewed_at TIMESTAMPTZ,
        reject_reason TEXT,
        ocr_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        ocr_raw_text TEXT,
        ocr_extracted_data JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_instructor_application_certificate_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
      );
      CREATE INDEX IF NOT EXISTS idx_instructor_application_certificates_application_id
        ON instructor_application_certificates(application_id);
      CREATE INDEX IF NOT EXISTS idx_instructor_application_certificates_tags
        ON instructor_application_certificates USING GIN (tags);
      ALTER TABLE instructor_application_certificates ADD COLUMN IF NOT EXISTS ocr_status VARCHAR(20) NOT NULL DEFAULT 'pending';
      ALTER TABLE instructor_application_certificates ADD COLUMN IF NOT EXISTS ocr_raw_text TEXT;
      ALTER TABLE instructor_application_certificates ADD COLUMN IF NOT EXISTS ocr_extracted_data JSONB;

      CREATE TABLE IF NOT EXISTS email_outbox (
        id BIGSERIAL PRIMARY KEY,
        to_email VARCHAR(255) NOT NULL,
        template VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        attempts INT NOT NULL DEFAULT 0,
        next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        locked_at TIMESTAMPTZ,
        last_error TEXT,
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_email_outbox_status CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED'))
      );
      CREATE INDEX IF NOT EXISTS idx_email_outbox_status_next_attempt
        ON email_outbox(status, next_attempt_at);
      ALTER TABLE instructor_applications
        ADD COLUMN IF NOT EXISTS requires_password BOOLEAN NOT NULL DEFAULT FALSE;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'instructor_applications_user_id_fkey'
            AND conrelid = 'public.instructor_applications'::regclass
        ) THEN
          ALTER TABLE instructor_applications
            ADD CONSTRAINT instructor_applications_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
      END $$;

      DROP TABLE IF EXISTS instructor_invites;
    `);

    // Backfill existing instructor profiles into the application workflow once.
    await dataSource.query(`
      INSERT INTO instructor_applications (
        email, full_name, headline, bio, website_url, social_links,
        status, review_reason, user_id, submitted_at, activated_at,
        version, created_at, updated_at
      )
      SELECT
        LOWER(u.email),
        u.name,
        p.headline,
        p.bio,
        p.website_url,
        p.social_links,
        CASE p.approval_status
          WHEN 2 THEN 'APPROVED'
          WHEN 3 THEN 'REJECTED'
          ELSE 'PENDING_REVIEW'
        END,
          p.review_reason,
          p.user_id,
          COALESCE(p.created_at, NOW()),
          CASE WHEN p.approval_status = 2 THEN p.approved_at ELSE NULL END,
          1,
          COALESCE(p.created_at, NOW()),
          COALESCE(p.updated_at, p.created_at, NOW())
        FROM instructor_profiles p
      INNER JOIN users u ON u.id = p.user_id
      WHERE NOT EXISTS (
        SELECT 1 FROM instructor_applications ma
        WHERE LOWER(ma.email) = LOWER(u.email)
      );
    `);

    await dataSource.query(`
      INSERT INTO instructor_application_certificates (
        application_id, certificate_name, issuer, issued_at, expires_at,
        file_key, legacy_file_path, file_name, mime_type, file_size,
        status, tags, reviewed_by, reviewed_at, reject_reason,
        created_at, updated_at
      )
      SELECT
        ma.id,
        c.certificate_name,
        c.issuer,
        c.issued_at,
        c.expires_at,
        NULL,
        c.file_path,
        c.file_name,
        c.mime_type,
        c.file_size,
        CASE c.certificate_status
          WHEN 2 THEN 'APPROVED'
          WHEN 3 THEN 'REJECTED'
          ELSE 'PENDING'
        END,
        c.tags,
        c.reviewed_by,
          c.reviewed_at,
          c.reject_reason,
          COALESCE(c.created_at, NOW()),
          COALESCE(c.updated_at, c.created_at, NOW())
        FROM instructor_certificates c
      INNER JOIN instructor_applications ma ON ma.user_id = c.user_id
      WHERE c.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM instructor_application_certificates mac
          WHERE mac.application_id = ma.id
            AND mac.legacy_file_path IS NOT DISTINCT FROM c.file_path
            AND mac.certificate_name = c.certificate_name
        );
    `);

    // 5. Tạo bảng bookings nếu chưa có
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id BIGSERIAL PRIMARY KEY,
        student_id BIGINT NOT NULL,
        instructor_id BIGINT NOT NULL,
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status SMALLINT DEFAULT 1,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_instructor_id ON bookings(instructor_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(12, 2) NOT NULL DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status SMALLINT NOT NULL DEFAULT 1;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(64);
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS booking_payments (
        id BIGSERIAL PRIMARY KEY,
        booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
        gateway VARCHAR(24) NOT NULL DEFAULT 'VNPAY',
        status SMALLINT NOT NULL DEFAULT 1,
        amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(8) NOT NULL DEFAULT 'VND',
        transaction_id VARCHAR(100),
        gateway_response JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_booking_payments_status ON booking_payments(status);
    `);
    // Migration: exam_questions.type (question type is an enum on the question itself)
    try {
      await dataSource.query(`
        DO $$ BEGIN
          ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS type varchar(50) DEFAULT 'MULTIPLE_CHOICE';
        EXCEPTION WHEN duplicate_column THEN null;
        END $$;
      `);
      await dataSource.query(`
        ALTER TABLE exam_questions DROP COLUMN IF EXISTS question_type_id;
      `);
      await dataSource.query(`
        DROP TABLE IF EXISTS exam_question_types CASCADE;
      `);
      await dataSource.query(`
        DROP TABLE IF EXISTS exam_format_section_question_types CASCADE;
      `);
      logger.log(
        'Migration exam_questions: type column added, question_type_id removed.',
      );
    } catch {
      logger.log('Migration exam_questions: already applied or skipped.');
    }

    // Migration: question_count on exam_sections; no question_type anywhere
    try {
      await dataSource.query(`
        ALTER TABLE exam_sections ADD COLUMN IF NOT EXISTS question_count integer DEFAULT 0;
      `);
      await dataSource.query(`
        ALTER TABLE exam_sections ADD COLUMN IF NOT EXISTS description TEXT;
      `);
      await dataSource.query(`
        ALTER TABLE exam_format_sections DROP COLUMN IF EXISTS question_type;
      `);
      await dataSource.query(`
        ALTER TABLE exam_sections DROP COLUMN IF EXISTS question_type;
      `);
      logger.log(
        'Migration sections: question_count added, question_type removed.',
      );
    } catch {
      logger.log('Migration sections: already applied or skipped.');
    }

    // Migration: exam_question_groups (group_type: AUDIO | PASSAGE | IMAGE | CUSTOM)
    try {
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS exam_question_groups (
          id BIGSERIAL PRIMARY KEY,
          section_id BIGINT NOT NULL REFERENCES exam_sections(id) ON DELETE CASCADE,
          group_type varchar(50) NOT NULL DEFAULT 'CUSTOM',
          title TEXT,
          instructions TEXT,
          position INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await dataSource.query(`
        ALTER TABLE exam_question_groups ADD COLUMN IF NOT EXISTS group_type varchar(50) NOT NULL DEFAULT 'CUSTOM';
      `);
      logger.log('Migration exam_question_groups: created with group_type.');
    } catch {
      logger.log('Migration exam_question_groups: already applied or skipped.');
    }

    // Migration: exam_group_materials (replaces the legacy exam_materials table)
    try {
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS exam_group_materials (
          id BIGSERIAL PRIMARY KEY,
          group_id BIGINT NOT NULL REFERENCES exam_question_groups(id) ON DELETE CASCADE,
          type varchar(50) NOT NULL DEFAULT 'TEXT',
          title VARCHAR(255),
          content TEXT,
          file_url TEXT,
          transcript TEXT,
          position INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      logger.log('Migration exam_group_materials: created.');
    } catch {
      logger.log('Migration exam_group_materials: already applied or skipped.');
    }

    // Migration: exam_questions.section_id required, group_id nullable
    try {
      await dataSource.query(`
        DO $$ BEGIN
          ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS section_id BIGINT;
        EXCEPTION WHEN duplicate_column THEN null;
        END $$;
      `);
      await dataSource.query(`
        DO $$ BEGIN
          ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS group_id BIGINT;
        EXCEPTION WHEN duplicate_column THEN null;
        END $$;
      `);

      // Backfill section_id from the question's group for grouped questions
      await dataSource.query(`
        UPDATE exam_questions eq
        SET section_id = eqg.section_id
        FROM exam_question_groups eqg
        WHERE eq.group_id = eqg.id AND eq.section_id IS NULL;
      `);

      await dataSource.query(`
        ALTER TABLE exam_questions ALTER COLUMN section_id SET NOT NULL;
      `);
      await dataSource.query(`
        ALTER TABLE exam_questions ALTER COLUMN group_id DROP NOT NULL;
      `);
      await dataSource.query(`
        DO $$ BEGIN
          ALTER TABLE exam_questions ADD FOREIGN KEY (section_id) REFERENCES exam_sections(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
      `);
      await dataSource.query(`
        DO $$ BEGIN
          ALTER TABLE exam_questions ADD FOREIGN KEY (group_id) REFERENCES exam_question_groups(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
      `);

      logger.log(
        'Migration exam_questions: section_id required, group_id nullable.',
      );
    } catch {
      logger.log('Migration exam_questions: already applied or skipped.');
    }

    // Migration: drop the legacy exam_materials table (replaced by exam_group_materials)
    try {
      await dataSource.query(`DROP TABLE IF EXISTS exam_materials CASCADE`);
      logger.log('Migration drop exam_materials: dropped.');
    } catch {
      logger.log('Migration drop exam_materials: already dropped or skipped.');
    }

    // Migration: exam_options — drop legacy option_key (không có trong entity; app định danh option bằng id/position)
    try {
      await dataSource.query(
        `ALTER TABLE exam_options DROP COLUMN IF EXISTS option_key`,
      );
      logger.log('Migration exam_options: legacy option_key dropped.');
    } catch {
      logger.log('Migration exam_options: already dropped or skipped.');
    }

    // 6. Tạo bảng meeting_rooms nếu chưa có
    await dataSource.query(`
      DO $$ BEGIN
        CREATE TYPE meeting_room_status_enum AS ENUM ('WAITING', 'ACTIVE', 'ENDED');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS meeting_rooms (
        id BIGSERIAL PRIMARY KEY,
        booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
        room_id VARCHAR(255) NOT NULL UNIQUE,
        provider VARCHAR(50) NOT NULL DEFAULT 'internal',
        status meeting_room_status_enum NOT NULL DEFAULT 'WAITING',
        started_at TIMESTAMPTZ,
        ended_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_meeting_rooms_booking_id ON meeting_rooms(booking_id);
    `);

    // 7. Lưu refresh token theo phiên đăng nhập
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS refresh_sessions (
        id UUID PRIMARY KEY,
        user_id BIGINT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        token_family UUID NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user_id ON refresh_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_sessions_token_hash ON refresh_sessions(token_hash);
    `);

    // 8. lesson_materials - tai lieu dinh kem tung bai hoc (file luu tren R2)
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS lesson_materials (
        id BIGSERIAL PRIMARY KEY,
        lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_key VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size BIGINT,
        mime_type VARCHAR(100),
        position INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson_id ON lesson_materials (lesson_id);
    `);

    // 9. lessons.thumbnail - anh xem truoc khi phat video (file luu tren R2)
    await dataSource.query(`
      ALTER TABLE lessons ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(255);
    `);

    logger.log('Khởi tạo / kiểm tra các bảng instructor và auth thành công!');

    // BEGIN: Instructor Skill Profiling (NEW MODULE)
    // 7. Tạo enum skill_category, skill_source_type, skill_evidence_status
    await dataSource.query(`
      DO $$ BEGIN
        CREATE TYPE skill_category_enum AS ENUM ('SUBJECT', 'PEDAGOGY');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await dataSource.query(
      `ALTER TYPE skill_category_enum ADD VALUE IF NOT EXISTS 'LANGUAGE';`,
    );
    await dataSource.query(
      `ALTER TYPE skill_category_enum ADD VALUE IF NOT EXISTS 'EXAM';`,
    );
    await dataSource.query(`
      DO $$ BEGIN
        CREATE TYPE skill_source_type_enum AS ENUM ('SELF_ASSESSMENT', 'EXPERIENCE', 'LESSON_PLAN', 'CERTIFICATE', 'STUDENT_RATING', 'STUDENT_OUTCOME');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await dataSource.query(`
      DO $$ BEGIN
        CREATE TYPE skill_evidence_status_enum AS ENUM ('ACTIVE', 'SUPERSEDED', 'REVOKED');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // 8. Tạo bảng instructor_skills
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS instructor_skills (
        id BIGSERIAL PRIMARY KEY,
        code VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        category skill_category_enum NOT NULL,
        description TEXT,
        display_order INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Tạo bảng instructor_skill_profiles
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS instructor_skill_profiles (
        id BIGSERIAL PRIMARY KEY,
        instructor_id BIGINT NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
        skill_id BIGINT NOT NULL REFERENCES instructor_skills(id) ON DELETE RESTRICT,
        score NUMERIC(4,3) NOT NULL CHECK (score BETWEEN 0 AND 1),
        confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
        evidence_count INT NOT NULL DEFAULT 0,
        model_version VARCHAR(30) NOT NULL,
        computed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_skill_profiles_instructor_skill ON instructor_skill_profiles(instructor_id, skill_id);
      CREATE INDEX IF NOT EXISTS idx_instructor_skill_profiles_skill_score_desc ON instructor_skill_profiles(skill_id, score DESC);
    `);

    // 10. Tạo bảng instructor_skill_evidences
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS instructor_skill_evidences (
        id BIGSERIAL PRIMARY KEY,
        instructor_id BIGINT NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
        skill_id BIGINT NOT NULL REFERENCES instructor_skills(id) ON DELETE RESTRICT,
        source_type skill_source_type_enum NOT NULL,
        source_id VARCHAR(100),
        score NUMERIC(4,3) NOT NULL CHECK (score BETWEEN 0 AND 1),
        weight NUMERIC(5,4) NOT NULL CHECK (weight >= 0),
        confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
        observed_at TIMESTAMP NOT NULL,
        extractor_version VARCHAR(30) NOT NULL,
        status skill_evidence_status_enum NOT NULL DEFAULT 'ACTIVE',
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_skill_evidences_active ON instructor_skill_evidences(instructor_id, skill_id, source_type, source_id, extractor_version) WHERE status='ACTIVE';
      CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_skill_evidences_null_source_active ON instructor_skill_evidences(instructor_id, skill_id, source_type, extractor_version) WHERE source_id IS NULL AND status='ACTIVE';
      CREATE INDEX IF NOT EXISTS idx_instructor_skill_evidences_instructor_skill_status ON instructor_skill_evidences(instructor_id, skill_id, status);
      CREATE INDEX IF NOT EXISTS idx_instructor_skill_evidences_source_type_id ON instructor_skill_evidences(source_type, source_id);
    `);

    // 11. Seed instructor_skills (idempotent) — bảng mã chung v2.
    //     Đổi mã cũ *_teaching trước khi seed để không tạo bản trùng.
    await dataSource.query(`
      UPDATE instructor_skills SET code = 'grammar', name = 'Grammar' WHERE code = 'grammar_teaching';
      UPDATE instructor_skills SET code = 'vocabulary', name = 'Vocabulary' WHERE code = 'vocabulary_teaching';
      UPDATE instructor_skills SET code = 'speaking', name = 'Speaking' WHERE code = 'speaking_teaching';
      UPDATE instructor_skills SET code = 'listening', name = 'Listening' WHERE code = 'listening_teaching';
      UPDATE instructor_skills SET code = 'writing', name = 'Writing' WHERE code = 'writing_teaching';
      UPDATE instructor_skills SET code = 'pronunciation', name = 'Pronunciation' WHERE code = 'pronunciation_teaching';
      UPDATE instructor_skills SET category = 'LANGUAGE'
        WHERE code IN ('grammar', 'vocabulary', 'speaking', 'listening', 'writing', 'pronunciation');
    `);
    await dataSource.query(`
      INSERT INTO instructor_skills (code, name, category, description, display_order, is_active)
      VALUES
        ('grammar', 'Grammar', 'LANGUAGE', 'English grammar rules and structures', 1, TRUE),
        ('vocabulary', 'Vocabulary', 'LANGUAGE', 'English vocabulary and word usage', 2, TRUE),
        ('speaking', 'Speaking', 'LANGUAGE', 'English speaking skills and fluency', 3, TRUE),
        ('listening', 'Listening', 'LANGUAGE', 'English listening comprehension', 4, TRUE),
        ('writing', 'Writing', 'LANGUAGE', 'English writing skills and composition', 5, TRUE),
        ('pronunciation', 'Pronunciation', 'LANGUAGE', 'English pronunciation and phonetics', 6, TRUE),
        ('reading', 'Reading', 'LANGUAGE', 'Reading comprehension', 7, TRUE),
        ('ielts', 'IELTS', 'EXAM', 'IELTS certificate', 8, TRUE),
        ('toeic', 'TOEIC', 'EXAM', 'TOEIC certificate', 9, TRUE),
        ('toefl', 'TOEFL', 'EXAM', 'TOEFL certificate', 10, TRUE),
        ('instructional_clarity', 'Instructional Clarity', 'PEDAGOGY', 'Clarity and effectiveness of teaching explanations', 11, TRUE),
        ('student_engagement', 'Student Engagement', 'PEDAGOGY', 'Ability to engage and motivate students in learning', 12, TRUE)
      ON CONFLICT (code) DO NOTHING;
      UPDATE instructor_skills
      SET display_order = CASE code
        WHEN 'instructional_clarity' THEN 11
        WHEN 'student_engagement' THEN 12
        ELSE display_order
      END
      WHERE code IN ('instructional_clarity', 'student_engagement');
    `);

    // 12. Teaching Profile — các cột giảng viên tự khai báo trên instructor_profiles
    await dataSource.query(`
      ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS experience_years SMALLINT;
      ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS teaching_levels JSON;
      ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS teaching_methods JSON;
      ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS teaching_video_url TEXT;
    `);

    // 13. Availability exceptions — "extra availability" (exception cộng thêm giờ thay vì chặn)
    await dataSource.query(`
      ALTER TABLE instructor_availability_exceptions ADD COLUMN IF NOT EXISTS is_extra BOOLEAN NOT NULL DEFAULT FALSE;
    `);

    // 14. Skill Scoring v2 — feature store (input ML) + minh bạch model trên profile
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS instructor_skill_features (
        id BIGSERIAL PRIMARY KEY,
        instructor_id BIGINT NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
        skill_id BIGINT NOT NULL REFERENCES instructor_skills(id) ON DELETE RESTRICT,
        features JSONB NOT NULL,
        sample_size INT NOT NULL DEFAULT 0,
        feature_version VARCHAR(30) NOT NULL DEFAULT 'fv1',
        computed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_skill_features_instructor_skill ON instructor_skill_features(instructor_id, skill_id);
    `);
    await dataSource.query(`
      ALTER TABLE instructor_skill_profiles ADD COLUMN IF NOT EXISTS model_kind VARCHAR(10) NOT NULL DEFAULT 'heuristic';
      ALTER TABLE instructor_skill_profiles ADD COLUMN IF NOT EXISTS score_model NUMERIC(4,3) CHECK (score_model BETWEEN 0 AND 1);
    `);

    // 15. Teacher evidence v2 — phân loại VERIFIED/INFERRED/DECLARED,
    //     verified_ratio, OCR copy trên chứng chỉ đã duyệt.
    await dataSource.query(`
      ALTER TABLE instructor_skill_profiles
        ADD COLUMN IF NOT EXISTS verified_ratio NUMERIC(4,3) NOT NULL DEFAULT 0
        CHECK (verified_ratio BETWEEN 0 AND 1);
      ALTER TABLE instructor_skill_evidences
        ADD COLUMN IF NOT EXISTS verification VARCHAR(10) NOT NULL DEFAULT 'INFERRED';
      ALTER TABLE instructor_skill_evidences
        ADD COLUMN IF NOT EXISTS capability VARCHAR(20) NOT NULL DEFAULT 'TEACHING';
      CREATE INDEX IF NOT EXISTS idx_instructor_skill_evidences_verification
        ON instructor_skill_evidences(verification);
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS ocr_status VARCHAR(20);
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS ocr_raw_text TEXT;
      ALTER TABLE instructor_certificates ADD COLUMN IF NOT EXISTS ocr_extracted_data JSONB;
    `);
    // Bằng chứng cũ bị dựng lại theo phân loại mới (giữ lịch sử, không xóa).
    // Idempotent: chỉ đánh dấu lại rows cũ (verification còn DEFAULT 'INFERRED'
    // từ khi ADD COLUMN) — rows chứng chỉ mới sinh bởi refresh luôn VERIFIED
    // nên không bị đụng ở các lần boot sau (trước đây chạy mỗi boot → nghiệt
    // toàn bộ evidence sau mỗi lần khởi động).
    await dataSource.query(`
      UPDATE instructor_skill_evidences
      SET status = 'SUPERSEDED'
      WHERE status = 'ACTIVE' AND (metadata ->> 'extracted') = 'true'
        AND verification = 'INFERRED';
      UPDATE instructor_skill_evidences
      SET verification = 'DECLARED', weight = 0
      WHERE source_type = 'SELF_ASSESSMENT'
        AND (metadata ->> 'extracted') IS DISTINCT FROM 'true';
      UPDATE instructor_certificates ic
      SET ocr_raw_text = ac.ocr_raw_text,
          ocr_extracted_data = ac.ocr_extracted_data,
          ocr_status = ac.ocr_status
      FROM instructor_applications ia
      JOIN instructor_application_certificates ac ON ac.application_id = ia.id
      WHERE ic.user_id = ia.user_id
        AND ic.certificate_name = ac.certificate_name
        AND ic.issued_at IS NOT DISTINCT FROM ac.issued_at
        AND ic.ocr_extracted_data IS NULL
        AND ac.ocr_extracted_data IS NOT NULL;
    `);

    // 16. Evidence-driven assessment runs/history. Latest profile remains a
    // projection; immutable runs/results/snapshots are the audit trail.
    await dataSource.query(`
      ALTER TABLE instructor_skill_profiles ALTER COLUMN score DROP NOT NULL;
      ALTER TABLE instructor_skill_profiles ALTER COLUMN confidence DROP NOT NULL;
      ALTER TABLE instructor_skill_profiles
        ADD COLUMN IF NOT EXISTS assessment_status VARCHAR(30) NOT NULL DEFAULT 'PROVISIONAL';
      ALTER TABLE instructor_skill_profiles
        ADD COLUMN IF NOT EXISTS independent_evidence_count INT NOT NULL DEFAULT 0;
      ALTER TABLE instructor_skill_profiles
        ADD COLUMN IF NOT EXISTS current_run_id BIGINT;

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
    `);

    // END: Instructor Skill Profiling
    logger.log(
      'Khởi tạo / kiểm tra bảng instructor_skill_profiling thành công!',
    );

    // BEGIN: Student Assessment (writing sample -> CEFR + focus targets)
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS student_assessments (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cefr_band VARCHAR(4),
        cefr_mean_level NUMERIC(4,2),
        vocab_coverage NUMERIC(4,3),
        vocab_low_confidence BOOLEAN,
        grammar_error_signal NUMERIC(7,2),
        grammar_reliability VARCHAR(8),
        word_count INT,
        accepted_changes INT,
        rejected_changes INT,
        grammar_model_version VARCHAR(80),
        vocab_model_version VARCHAR(80),
        text_sha256 CHAR(64),
        raw JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_student_assessments_user_created
        ON student_assessments (user_id, created_at DESC);
    `);
    // END: Student Assessment

    // BEGIN: Learner quiz (cloze từ vựng) + self-assessment — skill match 3 bước
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS student_quiz_attempts (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        form_seed BIGINT NOT NULL,
        item_count INT NOT NULL,
        raw_score INT NOT NULL,
        band VARCHAR(8),
        band_source VARCHAR(16),
        provisional_band VARCHAR(8),
        theta NUMERIC(8,4),
        se NUMERIC(8,4),
        calibrated BOOLEAN,
        per_band JSONB,
        responses JSONB,
        raw JSONB,
        model_version VARCHAR(80),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_student_quiz_attempts_user_created
        ON student_quiz_attempts (user_id, created_at DESC);

      -- Tự sửa width nếu bảng được tạo từ bản build cũ (idempotent).
      ALTER TABLE student_quiz_attempts ALTER COLUMN band TYPE VARCHAR(8);
      ALTER TABLE student_quiz_attempts ALTER COLUMN provisional_band TYPE VARCHAR(8);
      ALTER TABLE student_quiz_attempts ALTER COLUMN theta TYPE NUMERIC(8,4);
      ALTER TABLE student_quiz_attempts ALTER COLUMN se TYPE NUMERIC(8,4);

      CREATE TABLE IF NOT EXISTS student_self_assessments (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        band VARCHAR(8) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_student_self_assessments_user_created
        ON student_self_assessments (user_id, created_at DESC);
    `);
    // END: Learner quiz
  } catch (error) {
    logger.error(`Lỗi khi khởi tạo bảng database: ${(error as Error).message}`);
    throw error;
  }
}
