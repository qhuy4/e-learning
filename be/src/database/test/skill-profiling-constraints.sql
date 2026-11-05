-- skill-profiling-constraints.sql
-- Integration check cho các constraint DB của Instructor Skill Profiling.
-- Chạy:  psql -h localhost -p 5433 -U postgres -d edu-db -f src/database/test/skill-profiling-constraints.sql
-- Điều kiện: đã chạy UP (boot app hoặc 005_...sql) để bảng + seed 8 skills tồn tại.
-- Toàn bộ nằm trong 1 transaction và ROLLBACK ở cuối => không để lại dấu vết.
-- Thất bại = RAISE EXCEPTION 'FAIL...' => psql exit ≠ 0 (ON_ERROR_STOP).

\set ON_ERROR_STOP on

BEGIN;

DO $$
DECLARE
  v_pid   bigint;
  v_skill bigint;
  v_ev1   bigint;
  v_cnt   int;
BEGIN
  -- Temp instructor profile (user_id không có FK nên chèn tạm được; rollback sẽ xóa)
  INSERT INTO instructor_profiles (user_id, headline) VALUES (999999001, '__skill_constraint_test__')
  RETURNING id INTO v_pid;

  SELECT id INTO v_skill FROM instructor_skills WHERE code = 'grammar';
  IF v_skill IS NULL THEN
    RAISE EXCEPTION 'FAIL: seed instructor_skills thieu — chay UP truoc';
  END IF;

  -- 1) Duplicate ACTIVE evidence (cùng key) BỊ CHẶN
  BEGIN
    INSERT INTO instructor_skill_evidences
      (instructor_id, skill_id, source_type, source_id, score, weight, confidence, observed_at, extractor_version, status)
    VALUES (v_pid, v_skill, 'STUDENT_RATING', '42', 0.80, 0.85, 0.90, now(), 'v1', 'ACTIVE');
    INSERT INTO instructor_skill_evidences
      (instructor_id, skill_id, source_type, source_id, score, weight, confidence, observed_at, extractor_version, status)
    VALUES (v_pid, v_skill, 'STUDENT_RATING', '42', 0.70, 0.85, 0.90, now(), 'v1', 'ACTIVE');
    RAISE EXCEPTION 'FAIL: duplicate ACTIVE evidence bi chap nhan';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'PASS 1: duplicate ACTIVE evidence bi chan (partial unique)';
  END;

  -- 2) Duplicate evidence source_id NULL BỊ CHẶN (index riêng)
  BEGIN
    INSERT INTO instructor_skill_evidences
      (instructor_id, skill_id, source_type, source_id, score, weight, confidence, observed_at, extractor_version, status)
    VALUES (v_pid, v_skill, 'SELF_ASSESSMENT', NULL, 0.60, 0.15, 0.70, now(), 'v1', 'ACTIVE');
    INSERT INTO instructor_skill_evidences
      (instructor_id, skill_id, source_type, source_id, score, weight, confidence, observed_at, extractor_version, status)
    VALUES (v_pid, v_skill, 'SELF_ASSESSMENT', NULL, 0.65, 0.15, 0.70, now(), 'v1', 'ACTIVE');
    RAISE EXCEPTION 'FAIL: duplicate NULL-source evidence bi chap nhan';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'PASS 2: duplicate source_id NULL bi chan';
  END;

  -- 3) SUPERSEDED + INSERT lại cùng key OK (thay thế cùng version)
  INSERT INTO instructor_skill_evidences
    (instructor_id, skill_id, source_type, source_id, score, weight, confidence, observed_at, extractor_version, status)
  VALUES (v_pid, v_skill, 'STUDENT_RATING', '77', 0.50, 0.85, 0.90, now(), 'v1', 'ACTIVE')
  RETURNING id INTO v_ev1;
  UPDATE instructor_skill_evidences SET status = 'SUPERSEDED' WHERE id = v_ev1;
  INSERT INTO instructor_skill_evidences
    (instructor_id, skill_id, source_type, source_id, score, weight, confidence, observed_at, extractor_version, status)
  VALUES (v_pid, v_skill, 'STUDENT_RATING', '77', 0.55, 0.85, 0.92, now(), 'v1', 'ACTIVE');
  RAISE NOTICE 'PASS 3: thay the cung version sau SUPERSEDED duoc phep (lic su giu nguyen)';

  -- 4) CHECK score 0..1
  BEGIN
    INSERT INTO instructor_skill_evidences
      (instructor_id, skill_id, source_type, source_id, score, weight, confidence, observed_at, extractor_version, status)
    VALUES (v_pid, v_skill, 'STUDENT_RATING', '1', 1.5, 0.85, 0.9, now(), 'v1', 'ACTIVE');
    RAISE EXCEPTION 'FAIL: score > 1 bi chap nhan';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS 4: CHECK score BETWEEN 0 AND 1 hoat dong';
  END;

  -- 5) CHECK weight >= 0
  BEGIN
    INSERT INTO instructor_skill_evidences
      (instructor_id, skill_id, source_type, source_id, score, weight, confidence, observed_at, extractor_version, status)
    VALUES (v_pid, v_skill, 'STUDENT_RATING', '2', 0.5, -0.1, 0.9, now(), 'v1', 'ACTIVE');
    RAISE EXCEPTION 'FAIL: weight am bi chap nhan';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS 5: CHECK weight >= 0 hoat dong';
  END;

  -- 6) Upsert profile 2 lần => đúng 1 dòng, giá trị lần 2 thắng
  INSERT INTO instructor_skill_profiles
    (instructor_id, skill_id, score, confidence, evidence_count, model_version, computed_at)
  VALUES (v_pid, v_skill, 0.500, 0.400, 2, 'v1', now())
  ON CONFLICT (instructor_id, skill_id)
  DO UPDATE SET score = EXCLUDED.score, confidence = EXCLUDED.confidence,
                evidence_count = EXCLUDED.evidence_count, computed_at = EXCLUDED.computed_at;
  INSERT INTO instructor_skill_profiles
    (instructor_id, skill_id, score, confidence, evidence_count, model_version, computed_at)
  VALUES (v_pid, v_skill, 0.777, 0.650, 5, 'v1', now())
  ON CONFLICT (instructor_id, skill_id)
  DO UPDATE SET score = EXCLUDED.score, confidence = EXCLUDED.confidence,
                evidence_count = EXCLUDED.evidence_count, computed_at = EXCLUDED.computed_at;
  SELECT count(*) INTO v_cnt FROM instructor_skill_profiles WHERE instructor_id = v_pid AND skill_id = v_skill;
  IF v_cnt <> 1 THEN
    RAISE EXCEPTION 'FAIL: upsert 2 lan ma co % dong profile', v_cnt;
  END IF;
  IF (SELECT score FROM instructor_skill_profiles WHERE instructor_id = v_pid AND skill_id = v_skill) <> 0.777 THEN
    RAISE EXCEPTION 'FAIL: upsert khong cap nhat gia tri moi nhat';
  END IF;
  RAISE NOTICE 'PASS 6: upsert ON CONFLICT x2 => 1 dong, gia tri moi nhat thang';

  -- 7) FK skill_id RESTRICT: không xóa được skill đang được tham chiếu
  BEGIN
    DELETE FROM instructor_skills WHERE id = v_skill;
    RAISE EXCEPTION 'FAIL: xoa skill dang tham chieu bi chap nhan';
  EXCEPTION WHEN restrict_violation THEN
    RAISE NOTICE 'PASS 7: FK skill_id RESTRICT chong xoa catalog dang dung';
  END;
END $$;

ROLLBACK;

\echo 'ALL CONSTRAINT CHECKS PASSED (transaction rolled back)'
