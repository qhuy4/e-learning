/**
 * seed-exams.ts — wipe-and-reseed demo data for the exams module.
 *
 * Flow (safe to re-run — the end state is always identical):
 *   0) Validate ALL content definitions in memory (`seed-content/validate.ts`)
 *      — a broken content file aborts BEFORE the database is touched.
 *   1) Idempotent DDL: create any missing exam tables / enum types / columns.
 *   2) Ensure exam types (TOEIC / IELTS / GENERAL), one format per type with
 *      format sections (IELTS gains Writing + Speaking sections here — rows,
 *      not schema).
 *   3) WIPE: TRUNCATE exams + exam_attempts RESTART IDENTITY CASCADE
 *      (pulls in sections, groups, materials, questions, options, answers).
 *   4) Insert EXACTLY the exams declared in `seed-content/index.ts`
 *      (currently: 8 đề — 1 TOEIC L&R 200 câu, TOEIC Speaking, TOEIC Writing,
 *      4 đề IELTS 1-kỹ năng Listening/Reading/Writing/Speaking và 1 đề
 *      GENERAL Tổng hợp 20 câu cho giao diện đề chung; đề IELTS
 *      full 4-kỹ năng đã GỠ),
 *      one transaction per exam, with groups/materials/questions/options.
 *   5) Ensure the demo student account exists.
 *   6) Print a summary + live row counts read back from PostgreSQL.
 *
 * Run: npm run seed:exams
 */
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

import { SEED_EXAMS } from './seed-content';
import {
  countExamQuestions,
  countSectionQuestions,
  type SeedExam,
  type SeedGroup,
  type SeedQuestion,
} from './seed-content/types';
import { validateExamContent } from './seed-content/validate';

// pg has no bundled TypeScript types in this project -> plain require.
const { Client } = require('pg') as { Client: any };

const ENV_PATH = path.resolve(__dirname, '../../.env');

function readEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(ENV_PATH)) return out;
  for (const line of fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

const SCHEMA_STATEMENTS: string[] = [
  // Enum types used by the ORM entities (created idempotently).
  `DO $$ BEGIN
     CREATE TYPE exam_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
     CREATE TYPE exam_attempt_status AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
     CREATE TYPE exam_question_type AS ENUM (
       'MULTIPLE_CHOICE', 'MULTI_SELECT', 'TRUE_FALSE', 'FILL_BLANK',
       'MATCHING', 'SHORT_ANSWER', 'ESSAY', 'AUDIO_RECORD');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
     CREATE TYPE exam_material_type AS ENUM ('AUDIO', 'PASSAGE', 'IMAGE', 'TEXT');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  `CREATE TABLE IF NOT EXISTS exam_types (
     id BIGSERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     description TEXT,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
     CONSTRAINT uq_exam_types_name UNIQUE (name)
   );`,

  `CREATE TABLE IF NOT EXISTS exam_formats (
     id BIGSERIAL PRIMARY KEY,
     exam_type_id BIGINT NOT NULL REFERENCES exam_types(id),
     name VARCHAR(255) NOT NULL,
     version VARCHAR(50) NOT NULL,
     description TEXT,
     duration_seconds INTEGER,
     is_active BOOLEAN NOT NULL DEFAULT TRUE,
     effective_from DATE,
     effective_to DATE,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
     CONSTRAINT uq_exam_formats_name_version UNIQUE (exam_type_id, name, version)
   );`,

  `CREATE TABLE IF NOT EXISTS exam_format_sections (
     id BIGSERIAL PRIMARY KEY,
     exam_format_id BIGINT NOT NULL REFERENCES exam_formats(id) ON DELETE CASCADE,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     instructions TEXT,
     position INTEGER NOT NULL,
     duration_seconds INTEGER,
     question_count INTEGER NOT NULL DEFAULT 0,
     section_type VARCHAR(20),
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
     CONSTRAINT uq_exam_format_sections_position UNIQUE (exam_format_id, position)
   );`,

  // DB chạy trước khi cột này tồn tại (ALTER idempotent) → thêm cột khi seed.
  `ALTER TABLE exam_format_sections ADD COLUMN IF NOT EXISTS section_type VARCHAR(20);`,

  `CREATE TABLE IF NOT EXISTS exams (
     id BIGSERIAL PRIMARY KEY,
     exam_format_id BIGINT NOT NULL REFERENCES exam_formats(id),
     title VARCHAR(255) NOT NULL,
     description TEXT,
     is_premium BOOLEAN NOT NULL DEFAULT FALSE,
     duration_seconds INTEGER,
     status exam_status NOT NULL DEFAULT 'DRAFT',
     created_by BIGINT REFERENCES users(id),
     published_at TIMESTAMP,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );`,

  `CREATE TABLE IF NOT EXISTS exam_sections (
     id BIGSERIAL PRIMARY KEY,
     exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
     format_section_id BIGINT REFERENCES exam_format_sections(id),
     name VARCHAR(255) NOT NULL,
     description TEXT,
     instructions TEXT,
     position INTEGER NOT NULL,
     duration_seconds INTEGER,
     question_count INTEGER NOT NULL DEFAULT 0,
     section_type VARCHAR(20),
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
     CONSTRAINT uq_exam_sections_position UNIQUE (exam_id, position)
   );`,

  `ALTER TABLE exam_sections ADD COLUMN IF NOT EXISTS section_type VARCHAR(20);`,

  `CREATE TABLE IF NOT EXISTS exam_question_groups (
     id BIGSERIAL PRIMARY KEY,
     section_id BIGINT NOT NULL REFERENCES exam_sections(id) ON DELETE CASCADE,
     group_type VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',
     title TEXT,
     instructions TEXT,
     position INTEGER NOT NULL DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     CONSTRAINT uq_exam_question_groups_position UNIQUE (section_id, position)
   );`,

  `CREATE TABLE IF NOT EXISTS exam_group_materials (
     id BIGSERIAL PRIMARY KEY,
     group_id BIGINT NOT NULL REFERENCES exam_question_groups(id) ON DELETE CASCADE,
     type exam_material_type NOT NULL DEFAULT 'TEXT',
     title VARCHAR(255),
     content TEXT,
     file_url TEXT,
     transcript TEXT,
     position INTEGER NOT NULL DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );`,

  `CREATE TABLE IF NOT EXISTS exam_questions (
     id BIGSERIAL PRIMARY KEY,
     section_id BIGINT NOT NULL REFERENCES exam_sections(id) ON DELETE CASCADE,
     group_id BIGINT REFERENCES exam_question_groups(id) ON DELETE CASCADE,
     type exam_question_type NOT NULL DEFAULT 'MULTIPLE_CHOICE',
     question TEXT NOT NULL,
     explanation TEXT,
     points NUMERIC(8,2) NOT NULL DEFAULT 1,
     position INTEGER NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
     CONSTRAINT uq_exam_questions_position UNIQUE (group_id, position)
   );`,

  `CREATE TABLE IF NOT EXISTS exam_options (
     id BIGSERIAL PRIMARY KEY,
     question_id BIGINT NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     is_correct BOOLEAN NOT NULL DEFAULT FALSE,
     position INTEGER NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
     CONSTRAINT uq_exam_options_position UNIQUE (question_id, position)
   );`,

  `CREATE TABLE IF NOT EXISTS exam_attempts (
     id BIGSERIAL PRIMARY KEY,
     exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
     user_id BIGINT NOT NULL REFERENCES users(id),
     score NUMERIC(8,2) NOT NULL DEFAULT 0,
     correct_count INTEGER NOT NULL DEFAULT 0,
     total_questions INTEGER NOT NULL DEFAULT 0,
     status exam_attempt_status NOT NULL DEFAULT 'IN_PROGRESS',
     started_at TIMESTAMP NOT NULL DEFAULT NOW(),
     submitted_at TIMESTAMP,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );`,

  `CREATE TABLE IF NOT EXISTS exam_answers (
     id BIGSERIAL PRIMARY KEY,
     attempt_id BIGINT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
     question_id BIGINT NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
     selected_option_id BIGINT REFERENCES exam_options(id) ON DELETE SET NULL,
     answer_text TEXT,
     is_correct BOOLEAN NOT NULL DEFAULT FALSE,
     earned_points NUMERIC(8,2) NOT NULL DEFAULT 0,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
     CONSTRAINT uq_exam_answers_attempt_question UNIQUE (attempt_id, question_id)
   );`,

  // Supporting indexes (parity with the existing database).
  `CREATE INDEX IF NOT EXISTS idx_exams_format_id ON exams(exam_format_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);`,
  `CREATE INDEX IF NOT EXISTS idx_exams_created_by ON exams(created_by);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_sections_exam_id ON exam_sections(exam_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_question_groups_section_id ON exam_question_groups(section_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_questions_group_id ON exam_questions(group_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_questions_type ON exam_questions(type);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_options_question_id ON exam_options(question_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt_id ON exam_answers(attempt_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_answers_question_id ON exam_answers(question_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_formats_exam_type_id ON exam_formats(exam_type_id);`,
  `CREATE INDEX IF NOT EXISTS idx_exam_format_sections_format_id ON exam_format_sections(exam_format_id);`,

  // Columns the ORM entities expect but older databases are missing.
  `ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS correct_count INTEGER NOT NULL DEFAULT 0;`,
  `ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS total_questions INTEGER NOT NULL DEFAULT 0;`,
  `ALTER TABLE exam_answers ADD COLUMN IF NOT EXISTS earned_points NUMERIC(8,2) NOT NULL DEFAULT 0;`,
  `ALTER TABLE exam_sections ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0;`,
  `ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS explanation TEXT;`,

  // FK behavior patches (idempotent — database cũ đã tạo với RESTRICT → admin
  // không thể cập nhật option/câu hỏi/thả đề vì exam_answers trỏ vào).
  //   - selected_option_id: admin thay option cũ → SET NULL (giữ dòng đáp án).
  //   - question_id: xóa câu/group/section → cascade đáp án của câu đó.
  //   - attempts.exam_id: xóa đề → cascade attempts (attempt_id đã CASCADE).
  `ALTER TABLE exam_answers DROP CONSTRAINT IF EXISTS exam_answers_selected_option_id_fkey;`,
  `ALTER TABLE exam_answers ADD CONSTRAINT exam_answers_selected_option_id_fkey
     FOREIGN KEY (selected_option_id) REFERENCES exam_options(id) ON DELETE SET NULL;`,
  `ALTER TABLE exam_answers DROP CONSTRAINT IF EXISTS exam_answers_question_id_fkey;`,
  `ALTER TABLE exam_answers ADD CONSTRAINT exam_answers_question_id_fkey
     FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE;`,
  `ALTER TABLE exam_attempts DROP CONSTRAINT IF EXISTS exam_attempts_exam_id_fkey;`,
  `ALTER TABLE exam_attempts ADD CONSTRAINT exam_attempts_exam_id_fkey
     FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE;`,
];

/* ------------------------------------------------------------------ */
/* Formats (exam types + their format sections)                        */
/* ------------------------------------------------------------------ */

interface FormatSectionDef {
  name: string;
  description: string;
  questionCount: number;
  durationSeconds: number;
  /** Kỹ năng: LISTENING / READING / WRITING / SPEAKING — nguồn sự thật khi gen đề. */
  sectionType: string;
}

interface FormatDef {
  typeName: string;
  name: string;
  version: string;
  description: string;
  durationSeconds: number;
  sections: FormatSectionDef[];
}

const FORMATS: FormatDef[] = [
  {
    // Đề TOEIC Listening & Reading = đúng 7 Part (không gộp thành "Listening/Reading").
    typeName: 'TOEIC',
    name: 'TOEIC Format 2026',
    version: 'v1',
    description: 'Định dạng bài thi TOEIC Listening & Reading — 7 Part (100 câu Nghe + 100 câu Đọc, 200 câu).',
    durationSeconds: 7200,
    sections: [
      { name: 'Part 1', description: 'Photographs — 6 câu nghe mô tả ảnh', questionCount: 6, durationSeconds: 300, sectionType: 'LISTENING' },
      { name: 'Part 2', description: 'Question-Response — 25 câu hỏi và đáp', questionCount: 25, durationSeconds: 750, sectionType: 'LISTENING' },
      { name: 'Part 3', description: 'Conversations — 13 hội thoại × 3 câu = 39', questionCount: 39, durationSeconds: 900, sectionType: 'LISTENING' },
      { name: 'Part 4', description: 'Talks — 10 đoạn nói × 3 câu = 30', questionCount: 30, durationSeconds: 750, sectionType: 'LISTENING' },
      { name: 'Part 5', description: 'Incomplete Sentences — 30 câu hoàn thành câu', questionCount: 30, durationSeconds: 900, sectionType: 'READING' },
      { name: 'Part 6', description: 'Text Completion — 4 đoạn × 4 chỗ trống = 16', questionCount: 16, durationSeconds: 900, sectionType: 'READING' },
      { name: 'Part 7', description: 'Reading Comprehension — 12 văn bản = 54 câu', questionCount: 54, durationSeconds: 2700, sectionType: 'READING' },
    ],
  },
  {
    typeName: 'IELTS',
    name: 'IELTS Format 2026',
    version: 'v1',
    description: 'Định dạng bài thi IELTS Academic (Listening, Reading, Writing, Speaking).',
    durationSeconds: 9600,
    sections: [
      { name: 'Listening', description: 'Phần Nghe', questionCount: 40, durationSeconds: 1800, sectionType: 'LISTENING' },
      { name: 'Reading', description: 'Phần Đọc', questionCount: 40, durationSeconds: 3600, sectionType: 'READING' },
      { name: 'Writing', description: 'Phần Viết', questionCount: 2, durationSeconds: 3600, sectionType: 'WRITING' },
      { name: 'Speaking', description: 'Phần Nói', questionCount: 17, durationSeconds: 900, sectionType: 'SPEAKING' },
    ],
  },
  {
    typeName: 'GENERAL',
    name: 'Đề tổng hợp Format 2026',
    version: 'v1',
    description: 'Định dạng đề tổng hợp kiểm tra kiến thức chung (Nghe hiểu + Đọc hiểu, 20 câu).',
    durationSeconds: 1800,
    sections: [
      { name: 'Nghe hiểu', description: 'Phần Nghe hiểu — đoạn ghi âm + câu hỏi', questionCount: 10, durationSeconds: 600, sectionType: 'LISTENING' },
      { name: 'Đọc hiểu', description: 'Phần Đọc hiểu — câu hỏi kiến thức + đoạn văn', questionCount: 10, durationSeconds: 1200, sectionType: 'READING' },
    ],
  },
  // --- Định dạng cho các đề thi riêng từng kỹ năng (TOEIC Writing/Speaking, IELTS × 4).
  {
    typeName: 'TOEIC',
    name: 'TOEIC Writing Format 2026',
    version: 'v1',
    description: 'Định dạng bài thi TOEIC Writing — 8 task viết (mô tả tranh, phản hồi email, bài luận).',
    durationSeconds: 3600,
    sections: [
      { name: 'Writing', description: '8 task viết — trả lời bằng ô văn bản, chấm theo rubric', questionCount: 8, durationSeconds: 3600, sectionType: 'WRITING' },
    ],
  },
  {
    typeName: 'TOEIC',
    name: 'TOEIC Speaking Format 2026',
    version: 'v1',
    description: 'Định dạng bài thi TOEIC Speaking — 11 task nói (Read Aloud, Describe Picture, Respond, Opinion).',
    durationSeconds: 1200,
    sections: [
      { name: 'Speaking', description: '11 task nói — ghi âm từng task, đếm giờ chuẩn ETS', questionCount: 11, durationSeconds: 1200, sectionType: 'SPEAKING' },
    ],
  },
  {
    typeName: 'IELTS',
    name: 'IELTS Listening Format 2026',
    version: 'v1',
    description: 'Định dạng bài thi IELTS Listening — 4 section × 10 câu.',
    durationSeconds: 1800,
    sections: [
      { name: 'Listening', description: '4 section × 10 câu — audio + transcript', questionCount: 40, durationSeconds: 1800, sectionType: 'LISTENING' },
    ],
  },
  {
    typeName: 'IELTS',
    name: 'IELTS Reading Format 2026',
    version: 'v1',
    description: 'Định dạng bài thi IELTS Reading — 3 passage, 40 câu.',
    durationSeconds: 3600,
    sections: [
      { name: 'Reading', description: '3 passage (13 + 13 + 14) — cột bài đọc và câu hỏi cuộn độc lập', questionCount: 40, durationSeconds: 3600, sectionType: 'READING' },
    ],
  },
  {
    typeName: 'IELTS',
    name: 'IELTS Writing Format 2026',
    version: 'v1',
    description: 'Định dạng bài thi IELTS Writing — Task 1 (150+ từ) + Task 2 (250+ từ).',
    durationSeconds: 3600,
    sections: [
      { name: 'Writing', description: 'Task 1 biểu đồ + Task 2 essay — ô soạn thảo kèm đếm từ', questionCount: 2, durationSeconds: 3600, sectionType: 'WRITING' },
    ],
  },
  {
    typeName: 'IELTS',
    name: 'IELTS Speaking Format 2026',
    version: 'v1',
    description: 'Định dạng bài thi IELTS Speaking — Part 1 / Part 2 (cue card) / Part 3.',
    durationSeconds: 900,
    sections: [
      { name: 'Speaking', description: '3 phần — Part 2 có cue card, 1 phút chuẩn bị / 2 phút nói', questionCount: 17, durationSeconds: 900, sectionType: 'SPEAKING' },
    ],
  },
];

const DEMO_STUDENT = {
  name: 'Demo Student',
  email: 'student@demo.com',
  password: 'Demo@123456',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

async function getIdByName(
  client: any,
  table: string,
  name: string,
  extraWhere = '',
  extraParams: any[] = [],
): Promise<number | null> {
  const res = await client.query(
    `SELECT id FROM ${table} WHERE name = $1${extraWhere}`,
    [name, ...extraParams],
  );
  return res.rows.length ? Number(res.rows[0].id) : null;
}

interface InsertStats {
  sections: number;
  groups: number;
  materials: number;
  questions: number;
  options: number;
  gradable: number;
}

/**
 * Inserts ONE `SeedExam` (caller wraps it in BEGIN/COMMIT).
 * `registry` = { formatId, sections: { formatSectionName -> id } }.
 */
async function insertExam(
  client: any,
  exam: SeedExam,
  registry: { formatId: number; sections: Record<string, { id: number; sectionType: string | null }> },
): Promise<InsertStats> {
  const stats: InsertStats = {
    sections: 0,
    groups: 0,
    materials: 0,
    questions: 0,
    options: 0,
    gradable: 0,
  };

  const examRes = await client.query(
    `INSERT INTO exams (exam_format_id, title, description, is_premium, duration_seconds, status, created_by, published_at)
     VALUES ($1, $2, $3, $4, $5, 'PUBLISHED', NULL, NOW()) RETURNING id`,
    [registry.formatId, exam.title, exam.description, exam.isPremium ?? false, exam.durationSeconds],
  );
  const examId = Number(examRes.rows[0].id);

  const insertQuestion = async (
    question: SeedQuestion,
    sectionId: number,
    groupId: number | null,
    position: number,
  ): Promise<void> => {
    const type = question.type ?? 'MULTIPLE_CHOICE';
    const qRes = await client.query(
      `INSERT INTO exam_questions (section_id, group_id, type, question, explanation, points, position)
       VALUES ($1, $2, $3, $4, $5, 1, $6) RETURNING id`,
      [sectionId, groupId, type, question.q, question.explanation, position],
    );
    const questionId = Number(qRes.rows[0].id);
    stats.questions++;

    if (question.options && question.options.length > 0) {
      stats.gradable++;
      for (let i = 0; i < question.options.length; i++) {
        await client.query(
          `INSERT INTO exam_options (question_id, content, is_correct, position)
           VALUES ($1, $2, $3, $4)`,
          [questionId, question.options[i], i === question.answer, i + 1],
        );
        stats.options++;
      }
    } else if (question.answers && question.answers.length > 0) {
      // Text question with an answer key: every accepted answer becomes a
      // correct option — submit compares the typed answerText against them.
      stats.gradable++;
      for (let i = 0; i < question.answers.length; i++) {
        await client.query(
          `INSERT INTO exam_options (question_id, content, is_correct, position)
           VALUES ($1, $2, TRUE, $3)`,
          [questionId, question.answers[i], i + 1],
        );
        stats.options++;
      }
    }
  };

  let sectionPosition = 1;
  for (const section of exam.sections) {
    const formatSection = registry.sections[section.formatSection];
    if (!formatSection) {
      throw new Error(
        `Format section "${section.formatSection}" missing for type ${exam.typeName}`,
      );
    }
    const sectionQuestionCount = countSectionQuestions(section);
    const sectionRes = await client.query(
      `INSERT INTO exam_sections
         (exam_id, format_section_id, name, description, instructions, position, duration_seconds, question_count, section_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        examId,
        formatSection.id,
        section.name,
        section.description,
        section.instructions ?? null,
        sectionPosition,
        section.durationSeconds ?? null,
        sectionQuestionCount,
        // Kỹ năng kế thừa từ format — không suy từ tên section.
        formatSection.sectionType,
      ],
    );
    const sectionId = Number(sectionRes.rows[0].id);
    stats.sections++;

    let questionPosition = 1;
    for (const question of section.questions ?? []) {
      await insertQuestion(question, sectionId, null, questionPosition);
      questionPosition++;
    }

    let groupPosition = 1;
    for (const group of section.groups ?? []) {
      const groupRes = await client.query(
        `INSERT INTO exam_question_groups (section_id, group_type, title, instructions, position)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [sectionId, group.groupType ?? 'CUSTOM', group.title ?? null, group.instructions ?? null, groupPosition],
      );
      const groupId = Number(groupRes.rows[0].id);
      stats.groups++;
      groupPosition++;

      let materialPosition = 1;
      for (const material of group.materials ?? []) {
        await client.query(
          `INSERT INTO exam_group_materials (group_id, type, title, content, file_url, transcript, position)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            groupId,
            material.type,
            material.title ?? null,
            material.content ?? null,
            material.fileUrl ?? null,
            material.transcript ?? null,
            materialPosition,
          ],
        );
        materialPosition++;
        stats.materials++;
      }

      for (const question of group.questions) {
        await insertQuestion(question, sectionId, groupId, questionPosition);
        questionPosition++;
      }
    }

    sectionPosition++;
  }

  return stats;
}

async function countRows(client: any, table: string): Promise<number> {
  const res = await client.query(`SELECT COUNT(*) AS n FROM ${table}`);
  return Number(res.rows[0].n);
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  // 0) Validate ALL content in memory — abort BEFORE touching the database.
  for (const exam of SEED_EXAMS) {
    validateExamContent(exam);
    const gradable = exam.sections.reduce(
      (n, s) =>
        n +
        (s.questions ?? []).filter((q) => q.options?.length || q.answers?.length).length +
        (s.groups ?? []).reduce(
          (m, g) => m + g.questions.filter((q) => q.options?.length || q.answers?.length).length,
          0,
      ),
      0,
    );
    console.log(
      `[content] OK "${exam.title}" — ${countExamQuestions(exam)} câu (${gradable} câu có đáp án — chấm tự động), ${exam.sections.length} section.`,
    );
  }

  const env = readEnv();
  const client = new Client({
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT || 5432),
    user: env.DB_USERNAME || 'postgres',
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE || 'db',
  });
  await client.connect();

  const created = {
    examTypes: 0,
    formats: 0,
    formatSections: 0,
    exams: 0,
    sections: 0,
    groups: 0,
    materials: 0,
    questions: 0,
    options: 0,
    gradable: 0,
    students: 0,
  };

  try {
    // 1) Schema (idempotent DDL).
    for (const sql of SCHEMA_STATEMENTS) {
      await client.query(sql);
    }
    console.log('[schema] exam tables ensured (CREATE TABLE IF NOT EXISTS + column patches).');

    // 2) Exam types.
    const typeIds: Record<string, number> = {};
    for (const typeName of ['TOEIC', 'IELTS', 'GENERAL']) {
      let id = await getIdByName(client, 'exam_types', typeName);
      if (id === null) {
        const res = await client.query(
          'INSERT INTO exam_types (name, description) VALUES ($1, $2) RETURNING id',
          [typeName, `Loại bài thi ${typeName}`],
        );
        id = Number(res.rows[0].id);
        created.examTypes++;
      }
      typeIds[typeName] = id;
    }

    // 3) Formats + format sections (một registry cho MỖI format — key = tên format,
    //    vì một type giờ có nhiều format: TOEIC L&R / Writing / Speaking, IELTS × 5).
    const formatRegistry: Record<string, { formatId: number; sections: Record<string, { id: number; sectionType: string | null }> }> = {};
    const defaultFormatName: Record<string, string> = {};
    for (const format of FORMATS) {
      const typeId = typeIds[format.typeName];
      let formatId = await getIdByName(client, 'exam_formats', format.name, ' AND exam_type_id = $2', [typeId]);
      if (formatId === null) {
        const res = await client.query(
          `INSERT INTO exam_formats (exam_type_id, name, version, description, duration_seconds, is_active)
           VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING id`,
          [typeId, format.name, format.version, format.description, format.durationSeconds],
        );
        formatId = Number(res.rows[0].id);
        created.formats++;
      } else {
        // Format đã tồn tại → đồng bộ metadata với khai báo trong FORMATS
        // (seed là nguồn sự thật: version / description / duration_seconds).
        await client.query(
          `UPDATE exam_formats SET version = $2, description = $3, duration_seconds = $4, updated_at = NOW()
            WHERE id = $1`,
          [formatId, format.version, format.description, format.durationSeconds],
        );
      }

      // Format sections = khai báo chính thức của format → luôn KHỚP ĐÚNG định nghĩa:
      // gỡ liên kết khỏi exam_sections cũ, xóa sạch rồi insert lại (không để sót
      // section cũ như "Listening/Reading" của format TOEIC trước đây).
      await client.query(
        `UPDATE exam_sections SET format_section_id = NULL
          WHERE format_section_id IN (
            SELECT id FROM exam_format_sections WHERE exam_format_id = $1)`,
        [formatId],
      );
      await client.query(
        'DELETE FROM exam_format_sections WHERE exam_format_id = $1',
        [formatId],
      );

      const sections: Record<string, { id: number; sectionType: string | null }> = {};
      let position = 1;
      for (const section of format.sections) {
        const res = await client.query(
          `INSERT INTO exam_format_sections
             (exam_format_id, name, description, position, duration_seconds, question_count, section_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [formatId, section.name, section.description, position, section.durationSeconds, section.questionCount, section.sectionType],
        );
        sections[section.name] = { id: Number(res.rows[0].id), sectionType: section.sectionType };
        created.formatSections++;
        position++;
      }
      formatRegistry[format.name] = { formatId, sections };
      defaultFormatName[format.typeName] ??= format.name;
    }

    // 4) WIPE old exam content (idempotent seed => deterministic end state).
    //    CASCADE automatically pulls in sections, groups, materials, questions,
    //    options and answers that reference the truncated tables.
    const wipe = await client.query(
      'TRUNCATE TABLE exams, exam_attempts RESTART IDENTITY CASCADE',
    );
    console.log(
      `[wipe] old exam data removed (exams + attempts + all dependent rows${wipe.command ? `, ${wipe.command}` : ''}).`,
    );

    // 5) Insert EXACTLY the registry exams — one transaction per exam.
    for (const exam of SEED_EXAMS) {
      const formatName = exam.formatName ?? defaultFormatName[exam.typeName];
      const registry = formatName ? formatRegistry[formatName] : undefined;
      if (!registry) {
        throw new Error(
          `No format "${formatName ?? '(default)'}" registered for type ${exam.typeName}`,
        );
      }

      await client.query('BEGIN');
      try {
        const stats = await insertExam(client, exam, registry);
        await client.query('COMMIT');
        created.exams++;
        created.sections += stats.sections;
        created.groups += stats.groups;
        created.materials += stats.materials;
        created.questions += stats.questions;
        created.options += stats.options;
        created.gradable += stats.gradable;
        console.log(
          `[exam] "${exam.title}" — ${stats.sections} section, ${stats.groups} group, ` +
            `${stats.materials} material, ${stats.questions} câu (${stats.options} phương án).`,
        );
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    // 6) Demo student account (role STUDENT = 3, ACTIVE = 1).
    const userExists = await client.query('SELECT id FROM users WHERE email = $1', [DEMO_STUDENT.email]);
    if (!userExists.rows.length) {
      const hash = bcrypt.hashSync(DEMO_STUDENT.password, 10);
      await client.query(
        `INSERT INTO users (name, email, password, status, role) VALUES ($1, $2, $3, 1, 3)`,
        [DEMO_STUDENT.name, DEMO_STUDENT.email, hash],
      );
      created.students++;
    }

    // 7) Summary + live row counts read back from PostgreSQL.
    const live = {
      exams: await countRows(client, 'exams'),
      sections: await countRows(client, 'exam_sections'),
      groups: await countRows(client, 'exam_question_groups'),
      materials: await countRows(client, 'exam_group_materials'),
      questions: await countRows(client, 'exam_questions'),
      options: await countRows(client, 'exam_options'),
      attempts: await countRows(client, 'exam_attempts'),
    };
    const examList = await client.query(
      `SELECT e.id, e.title, e.is_premium, e.duration_seconds, e.status,
              (SELECT COUNT(*) FROM exam_sections s WHERE s.exam_id = e.id) AS sections,
              (SELECT COUNT(*) FROM exam_questions q
                 JOIN exam_sections s2 ON s2.id = q.section_id
                WHERE s2.exam_id = e.id) AS questions
         FROM exams e ORDER BY e.id`,
    );

    console.log('\n========== SEED SUMMARY ==========');
    console.log(`exam types created      : ${created.examTypes}`);
    console.log(`exam formats created    : ${created.formats}`);
    console.log(`format sections created : ${created.formatSections}`);
    console.log(`demo students created   : ${created.students}`);
    console.log('----------------------------------');
    for (const row of examList.rows) {
      console.log(
        `#${row.id} ${row.title} [${row.status}${row.is_premium ? ', premium' : ''}] — ` +
          `${row.sections} section, ${row.questions} câu, ${row.duration_seconds}s`,
      );
    }
    console.log('----------------------------------');
    console.log(`exams           (DB)     : ${live.exams}`);
    console.log(`exam_sections   (DB)     : ${live.sections}`);
    console.log(`groups          (DB)     : ${live.groups}`);
    console.log(`materials       (DB)     : ${live.materials}`);
    console.log(`questions       (DB)     : ${live.questions}`);
    console.log(`options         (DB)     : ${live.options}`);
    console.log(`attempts        (DB)     : ${live.attempts}`);
    console.log(`trắc nghiệm chấm tự động : ${created.gradable}/${created.questions}`);
    console.log(`demo credentials         : ${DEMO_STUDENT.email} / ${DEMO_STUDENT.password}`);
    console.log('==================================');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[seed:exams] FAILED:', err);
  process.exit(1);
});
