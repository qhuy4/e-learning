-- 008: lesson_comments - binh luan hoi dap tren tung bai hoc
--
-- Moi binh luan co the co loi tra loi nhieu cap (parent_id) nhu Facebook/YouTube.
-- Xoa binh luan cha → xoa ca nhanh con (ON DELETE CASCADE).
-- Rieng tung tai khoan, giang vien cua khoa hoi tra loi bang cung bang nay.

CREATE TABLE IF NOT EXISTS lesson_comments (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id BIGINT REFERENCES lesson_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson_id ON lesson_comments (lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_parent_id ON lesson_comments (parent_id);
