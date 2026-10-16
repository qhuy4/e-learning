-- 005: lesson_materials - tai lieu dinh kem cho tung bai hoc
--
-- Moi bai hoc co the dinh kem nhieu tai lieu (PDF, Word, PowerPoint, ...).
-- File luu tren Cloudflare R2 (file_key), thong tin hien thi luu trong bang nay.
-- Quan ly doc lap theo tung bai hoc (chi lien ket lesson_id, khong phu thuoc
-- section/course).

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
