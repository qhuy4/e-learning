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

    logger.log('Khởi tạo / kiểm tra các bảng instructor và auth thành công!');
  } catch (error) {
    logger.error(`Lỗi khi khởi tạo bảng database: ${(error as Error).message}`);
  }
}
