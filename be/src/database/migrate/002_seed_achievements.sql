-- Add category column to achievements
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS category varchar(100);

-- Clear old achievements
TRUNCATE TABLE user_achievements CASCADE;
DELETE FROM achievements;

-- Reset sequence
ALTER SEQUENCE achievements_id_seq RESTART WITH 1;

-- ============================================
-- 🌱 Progress (5 badges)
-- ============================================
INSERT INTO achievements (name, description, icon, category, criteria, threshold, is_active, created_at, updated_at) VALUES
('First Step', 'Complete your first lesson', '🌱', 'Progress', 'LESSONS_COMPLETED', 1, true, NOW(), NOW()),
('Bookworm', 'Complete 10 lessons', '📖', 'Progress', 'LESSONS_COMPLETED', 10, true, NOW(), NOW()),
('Dedicated Learner', 'Complete 25 lessons', '📚', 'Progress', 'LESSONS_COMPLETED', 25, true, NOW(), NOW()),
('Knowledge Seeker', 'Complete 50 lessons', '🎓', 'Progress', 'LESSONS_COMPLETED', 50, true, NOW(), NOW()),
('Course Graduate', 'Complete 1 course', '🏆', 'Progress', 'COURSES_COMPLETED', 1, true, NOW(), NOW()),
('Course Master', 'Complete 5 courses', '🎓', 'Progress', 'COURSES_COMPLETED', 5, true, NOW(), NOW());

-- ============================================
-- 🧠 Quiz / Knowledge (5 badges)
-- ============================================
INSERT INTO achievements (name, description, icon, category, criteria, threshold, is_active, created_at, updated_at) VALUES
('Quiz Starter', 'Complete your first quiz', '📝', 'Quiz / Knowledge', 'QUIZZES_COMPLETED', 1, true, NOW(), NOW()),
('Quiz Master', 'Complete 10 quizzes', '🧠', 'Quiz / Knowledge', 'QUIZZES_COMPLETED', 10, true, NOW(), NOW()),
('Perfect Score', 'Get 100% on a quiz', '💯', 'Quiz / Knowledge', 'PERFECT_QUIZ_SCORE', 1, true, NOW(), NOW()),
('Sharp Mind', 'Score 90%+ on 5 quizzes', '🎯', 'Quiz / Knowledge', 'HIGH_QUIZ_SCORES', 5, true, NOW(), NOW()),
('Quiz Champion', 'Score 90%+ on 20 quizzes', '🏅', 'Quiz / Knowledge', 'HIGH_QUIZ_SCORES', 20, true, NOW(), NOW());

-- ============================================
-- 🔥 Streak (4 badges)
-- ============================================
INSERT INTO achievements (name, description, icon, category, criteria, threshold, is_active, created_at, updated_at) VALUES
('3-Day Streak', 'Study 3 days in a row', '🔥', 'Streak', 'STREAK_DAYS', 3, true, NOW(), NOW()),
('7-Day Streak', 'Study 7 days in a row', '🔥', 'Streak', 'STREAK_DAYS', 7, true, NOW(), NOW()),
('14-Day Streak', 'Study 14 days in a row', '🔥', 'Streak', 'STREAK_DAYS', 14, true, NOW(), NOW()),
('30-Day Streak', 'Study 30 days in a row', '🔥', 'Streak', 'STREAK_DAYS', 30, true, NOW(), NOW());

-- ============================================
-- 🗣️ Language Skills (4 badges)
-- ============================================
INSERT INTO achievements (name, description, icon, category, criteria, threshold, is_active, created_at, updated_at) VALUES
('Speaking Starter', 'Complete your first speaking session', '🗣️', 'Language Skills', 'SPEAKING_SESSIONS', 1, true, NOW(), NOW()),
('Speaking Star', 'Complete 10 speaking sessions', '🎤', 'Language Skills', 'SPEAKING_SESSIONS', 10, true, NOW(), NOW()),
('Grammar Guardian', 'Complete 20 grammar exercises', '✍️', 'Language Skills', 'GRAMMAR_EXERCISES', 20, true, NOW(), NOW()),
('Vocabulary Builder', 'Learn 100 vocabulary words', '📕', 'Language Skills', 'VOCABULARY_WORDS', 100, true, NOW(), NOW());

-- ============================================
-- ⭐ Milestone (2 badges)
-- ============================================
INSERT INTO achievements (name, description, icon, category, criteria, threshold, is_active, created_at, updated_at) VALUES
('Rising Star', 'Earn 10 achievements', '🌟', 'Milestone', 'ACHIEVEMENTS_EARNED', 10, true, NOW(), NOW()),
('PiEMind Master', 'Earn 20 achievements', '👑', 'Milestone', 'ACHIEVEMENTS_EARNED', 20, true, NOW(), NOW());
