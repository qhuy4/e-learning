-- 008 — Mentor application workflow
--
-- UP   : được áp dụng tự động mỗi khi app boot (src/database/init-db.ts,
--        khối "Mentor application workflow"). File này là bản sao canonical
--        để replay thủ công: psql -f 008_mentor_workflow.sql (chỉ phần UP).
-- DOWN : rollback thủ công — cắt phần DOWN ra chạy riêng.
--
-- Quy tắc:
--   * mentor_applications là source of truth cho đơn đăng ký mentor. Không có
--     account trước khi admin duyệt.
--   * mentor_tokens chỉ lưu SHA-256 hash của token opaque; token gốc chỉ gửi
--     qua email, dùng một lần, có hạn.
--   * Chứng chỉ mới dùng private R2 + file_key; legacy_file_path giữ đường dẫn
--     công khai cũ để tương thích dữ liệu đã có.
--   * email_outbox là hàng đợi gửi mail bền vững (retry được).

-- ============================ UP ============================

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
CREATE INDEX IF NOT EXISTS idx_instructor_certificates_tags
  ON instructor_certificates USING GIN (tags);

ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS review_reason TEXT;

CREATE TABLE IF NOT EXISTS mentor_applications (
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
  CONSTRAINT chk_mentor_application_status CHECK (
    status IN ('PENDING_SUBMISSION', 'PENDING_INFORMATION', 'PENDING_REVIEW', 'APPROVED', 'REJECTED')
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mentor_applications_email_lower
  ON mentor_applications (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_mentor_applications_status ON mentor_applications(status);
CREATE INDEX IF NOT EXISTS idx_mentor_applications_user_id ON mentor_applications(user_id);

ALTER TABLE mentor_applications
  ALTER COLUMN status SET DEFAULT 'PENDING_SUBMISSION';
ALTER TABLE mentor_applications
  DROP CONSTRAINT IF EXISTS chk_mentor_application_status;
UPDATE mentor_applications
  SET status = 'PENDING_SUBMISSION'
  WHERE status = 'PENDING_INFORMATION' AND submitted_at IS NULL;
ALTER TABLE mentor_applications
  ADD CONSTRAINT chk_mentor_application_status CHECK (
    status IN ('PENDING_SUBMISSION', 'PENDING_INFORMATION', 'PENDING_REVIEW', 'APPROVED', 'REJECTED')
  );

CREATE TABLE IF NOT EXISTS mentor_tokens (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES mentor_applications(id) ON DELETE CASCADE,
  user_id BIGINT,
  purpose VARCHAR(20) NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_mentor_token_purpose CHECK (purpose IN ('APPLICATION', 'ACTIVATION'))
);
CREATE INDEX IF NOT EXISTS idx_mentor_tokens_application_id ON mentor_tokens(application_id);
CREATE INDEX IF NOT EXISTS idx_mentor_tokens_purpose ON mentor_tokens(purpose);

CREATE TABLE IF NOT EXISTS mentor_application_certificates (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES mentor_applications(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_mentor_certificate_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);
CREATE INDEX IF NOT EXISTS idx_mentor_application_certificates_application_id
  ON mentor_application_certificates(application_id);
CREATE INDEX IF NOT EXISTS idx_mentor_application_certificates_tags
  ON mentor_application_certificates USING GIN (tags);

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

ALTER TABLE mentor_applications
  ADD COLUMN IF NOT EXISTS requires_password BOOLEAN NOT NULL DEFAULT FALSE;
DROP TABLE IF EXISTS instructor_invites;

INSERT INTO mentor_applications (
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
  SELECT 1 FROM mentor_applications ma
  WHERE LOWER(ma.email) = LOWER(u.email)
);

INSERT INTO mentor_application_certificates (
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
INNER JOIN mentor_applications ma ON ma.user_id = c.user_id
WHERE c.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM mentor_application_certificates mac
    WHERE mac.application_id = ma.id
      AND mac.legacy_file_path IS NOT DISTINCT FROM c.file_path
      AND mac.certificate_name = c.certificate_name
  );

-- ============================ DOWN ============================
-- Chạy tay khi rollback. Thứ tự theo FK.

-- DROP TABLE IF EXISTS email_outbox;
-- DROP TABLE IF EXISTS mentor_application_certificates;
-- DROP TABLE IF EXISTS mentor_tokens;
-- DROP TABLE IF EXISTS mentor_applications;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS deleted_at;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS updated_at;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS reject_reason;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS reviewed_at;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS reviewed_by;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS tags;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS file_size;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS mime_type;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS file_name;
-- ALTER TABLE instructor_certificates DROP COLUMN IF EXISTS file_key;
-- ALTER TABLE instructor_profiles DROP COLUMN IF EXISTS review_reason;
