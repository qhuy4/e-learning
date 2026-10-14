import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

export async function initDatabaseTables(dataSource: DataSource) {
  const logger = new Logger('InitDatabase');
  try {
    // 1. Tạo bảng instructor_invites nếu chưa có
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS instructor_invites (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_instructor_invites_email ON instructor_invites(email);
    `);

    // 2. Tạo bảng instructor_profiles nếu chưa có
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
    `);

    // 3. Tạo bảng instructor_kyc nếu chưa có
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS instructor_kyc (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        kyc_status SMALLINT NOT NULL DEFAULT 1,
        identity_number VARCHAR(50) NOT NULL,
        identity_front VARCHAR(500) NOT NULL,
        identity_back VARCHAR(500) NOT NULL,
        selfie_with_id VARCHAR(500) NOT NULL,
        ocr_verified BOOLEAN DEFAULT FALSE,
        face_verified BOOLEAN DEFAULT FALSE,
        ocr_data JSON,
        face_data JSON,
        reject_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_instructor_kyc_user_id ON instructor_kyc(user_id);
      CREATE TABLE IF NOT EXISTS instructor_kyc_history (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        kyc_snapshot JSONB NOT NULL,
        certificates_snapshot JSONB NOT NULL,
        archived_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_instructor_kyc_history_user_id ON instructor_kyc_history(user_id);
    `);

    // 4. Tạo bảng instructor_certificates nếu chưa có
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
    `);

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

    logger.log('Khởi tạo / kiểm tra các bảng instructor và auth thành công!');
  } catch (error) {
    logger.error(`Lỗi khi khởi tạo bảng database: ${(error as Error).message}`);
  }
}
