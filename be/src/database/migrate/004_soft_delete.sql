-- 004 — Soft delete cho exams + exam_types
--
-- deleted_at IS NULL  = còn hiệu lực (hiển thị trong danh sách active)
-- deleted_at set      = đã xóa mềm — chỉ ẩn, KHÔNG xóa hàng loạt dữ liệu:
--                       exam_sections / exam_question_groups / exam_questions /
--                       exam_options / exam_group_materials +
--                       exam_attempts / exam_answers giữ nguyên 100%.
--
-- Quy tắc hiển thị (áp dụng ở repository):
--   * Danh sách active của Exam   : exam.deleted_at IS NULL
--                                   AND exam_types.deleted_at IS NULL (qua
--                                   exam_formats -> exam_types) — loại đề bị
--                                   xóa thì các đề thuộc loại đó cũng ẩn.
--   * Restore Exam Type           : các exam chưa bị xóa riêng hiện lại ngay.
--   * Restore Exam                : chỉ hiện lại nếu exam_types đang active.
--
-- exam_formats (thêm sau — "Định dạng đề thi" cũng có mục Đã xóa + Khôi phục):
--   * xóa format = chỉ set deleted_at — exam thuộc format đó ẩn theo,
--     không đụng exams/sections/questions; ?force=1 mới là xóa cứng.

ALTER TABLE exams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE exam_types ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE exam_formats ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_exams_deleted_at ON exams (deleted_at);
CREATE INDEX IF NOT EXISTS idx_exam_types_deleted_at ON exam_types (deleted_at);
CREATE INDEX IF NOT EXISTS idx_exam_formats_deleted_at ON exam_formats (deleted_at);
