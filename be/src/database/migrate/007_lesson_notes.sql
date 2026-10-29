-- 007: lesson_notes - ghi chu ca nhan cua hoc vien trong bai hoc
--
-- Moi ghi chu gan voi mot diem thoi gian video (note_time_seconds) de khi bam
-- vao la tua video ve do xem lai. Rieng tung tai khoan (user_id), khong chia se.

CREATE TABLE IF NOT EXISTS lesson_notes (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  note_time_seconds INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_lesson ON lesson_notes (user_id, lesson_id);
