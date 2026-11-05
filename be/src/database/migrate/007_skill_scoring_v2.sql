-- 007 — Skill Scoring v2 (feature store + minh bạch model)
--
-- UP   : được áp dụng tự động mỗi khi app boot (src/database/init-db.ts,
--        khối "BEGIN: Skill Scoring v2"). File này là bản sao canonical
--        để replay thủ công:  psql -f 007_skill_scoring_v2.sql (chỉ phần UP).
-- DOWN : rollback thủ công — cắt phần DOWN ra chạy riêng.
--
-- Quy tắc:
--   * instructor_skill_features = input layer cho scoring v2: 1 dòng/instructor ×
--     skill, features JSONB do SkillFeatureExtractor ghi. Không phải evidence —
--     giảng viên không thấy bảng này, chỉ dùng nội bộ cho score/confidence.
--     sample_size = số quan sát thật (vd: n quiz attempt) — input cho α-ramp
--     và debug; KHÔNG nhầm với evidence_count trên profile.
--   * instructor_skill_profiles thêm 2 cột minh bạch (không đổi shape cũ —
--     matching vẫn chỉ đọc score/confidence):
--       model_kind   : 'heuristic' = chỉ công thức, 'blend' = có model contribution,
--                      'model' = giữ chỗ (hiện blend luôn kèm heuristic ≥30%).
--       score_model  : điểm thô từ model JSON (NULL khi model_kind='heuristic')
--                      — cho phép audit lại blend mà không cần re-inference.
--   * model_version ghi label đầy đủ khi blend: 'v2' hoặc 'v2-<trained_at>'
--     (xem skill-model.service.ts) để reproducible.

-- ============================ UP ============================

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
CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_skill_features_instructor_skill
  ON instructor_skill_features(instructor_id, skill_id);

ALTER TABLE instructor_skill_profiles
  ADD COLUMN IF NOT EXISTS model_kind VARCHAR(10) NOT NULL DEFAULT 'heuristic';
ALTER TABLE instructor_skill_profiles
  ADD COLUMN IF NOT EXISTS score_model NUMERIC(4,3) CHECK (score_model BETWEEN 0 AND 1);

-- ============================ DOWN ============================
-- Chạy tay khi rollback. Thứ tự theo FK (features -> profile).

-- ALTER TABLE instructor_skill_profiles DROP COLUMN IF EXISTS score_model;
-- ALTER TABLE instructor_skill_profiles DROP COLUMN IF EXISTS model_kind;
-- DROP TABLE IF EXISTS instructor_skill_features;
