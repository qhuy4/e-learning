-- 013: quizzes + dictations schema (was never created in edu-db)
--
-- Generated from the TypeORM entities (source of truth):
--   quizzes/, dictations/ modules -> infrastructure/entity/*.ts
-- Idempotent: safe to re-run. TypeORM runs with synchronize: false,
-- so this file (plus seed scripts) is the only way these tables appear.

-- ---------------------------------------------------------------------------
-- Enum types (Postgres has no CREATE TYPE IF NOT EXISTS -> DO blocks)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE quiz_question_type_enum AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE quiz_attempt_status_enum AS ENUM ('IN_PROGRESS', 'SUBMITTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE dictation_level_enum AS ENUM
    ('BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- quizzes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  time_limit INTEGER,
  passing_score INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
  shuffle_options BOOLEAN NOT NULL DEFAULT FALSE,
  show_answer_after_submit BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id BIGSERIAL PRIMARY KEY,
  quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type quiz_question_type_enum NOT NULL DEFAULT 'MULTIPLE_CHOICE',
  audio_url TEXT,
  image_url TEXT,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS quiz_options (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id BIGSERIAL PRIMARY KEY,
  quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  status quiz_attempt_status_enum NOT NULL DEFAULT 'IN_PROGRESS',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id BIGSERIAL PRIMARY KEY,
  attempt_id BIGINT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_id BIGINT REFERENCES quiz_options(id) ON DELETE SET NULL,
  answer_text TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  earned_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_quiz_answers_attempt_question
  ON quiz_answers(attempt_id, question_id);

CREATE TABLE IF NOT EXISTS lesson_quizzes (
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, quiz_id)
);

-- ---------------------------------------------------------------------------
-- dictations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dictations (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  level dictation_level_enum NOT NULL DEFAULT 'BEGINNER',
  play_limit INTEGER,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dictation_sentences (
  id BIGSERIAL PRIMARY KEY,
  dictation_id BIGINT NOT NULL REFERENCES dictations(id) ON DELETE CASCADE,
  sentence TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  position INTEGER NOT NULL,
  hint TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dictation_sentences_dictation_id
  ON dictation_sentences(dictation_id);

CREATE TABLE IF NOT EXISTS dictation_attempts (
  id BIGSERIAL PRIMARY KEY,
  dictation_id BIGINT NOT NULL REFERENCES dictations(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dictation_attempts_dictation_id
  ON dictation_attempts(dictation_id);
CREATE INDEX IF NOT EXISTS idx_dictation_attempts_user_id
  ON dictation_attempts(user_id);

CREATE TABLE IF NOT EXISTS dictation_answers (
  id BIGSERIAL PRIMARY KEY,
  attempt_id BIGINT NOT NULL REFERENCES dictation_attempts(id) ON DELETE CASCADE,
  sentence_id BIGINT NOT NULL REFERENCES dictation_sentences(id) ON DELETE CASCADE,
  answer_text TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  similarity NUMERIC(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dictation_answers_attempt_id
  ON dictation_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_dictation_answers_sentence_id
  ON dictation_answers(sentence_id);

CREATE TABLE IF NOT EXISTS lesson_dictations (
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  dictation_id BIGINT NOT NULL REFERENCES dictations(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, dictation_id)
);
