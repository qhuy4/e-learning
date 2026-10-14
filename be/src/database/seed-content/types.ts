/**
 * seed-content/types.ts — content model shared by every seed-content file.
 *
 * A seed-content file exports ONE `SeedExam`; the orchestrator
 * (`seed-exams.ts`) validates the content, repairs/wipes the exam tables and
 * inserts whatever the registry in `seed-content/index.ts` declares.
 *
 * Nothing here talks to the database — content files are pure data, so they
 * are cheap to validate (`validate.ts`) and safe to edit.
 *
 * NOTE ON MISSING COLUMNS: the ORM entities expose no `slug`, `total_questions`
 * or `difficulty` columns on `exams` / `exam_questions` (entities are frozen —
 * no schema changes allowed), so those metadata live inside `description` and
 * inside each question's `explanation` (see `note()` below).
 */

/** Question types supported by the `exam_question_type` enum. */
export type SeedQuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTI_SELECT'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'MATCHING'
  | 'SHORT_ANSWER'
  | 'ESSAY'
  | 'AUDIO_RECORD';

/**
 * Types graded from the selected options (single / multi / true-false).
 *
 * CONTRACT (submit): a question is graded when it carries an answer key —
 * choice questions via `options`+`answer`, text questions (FILL_BLANK,
 * SHORT_ANSWER …) via `answers` (each accepted answer stored as a correct
 * option and checked against the typed `answerText`). Questions WITHOUT a
 * key (ESSAY, AUDIO_RECORD …) are recorded through `answerText` but never
 * graded, so they never lower the score.
 */
export const AUTO_GRADABLE_TYPES: readonly SeedQuestionType[] = [
  'MULTIPLE_CHOICE',
  'MULTI_SELECT',
  'TRUE_FALSE',
];

export type SeedMaterialType = 'AUDIO' | 'PASSAGE' | 'IMAGE' | 'TEXT';
export type SeedGroupType = 'AUDIO' | 'PASSAGE' | 'IMAGE' | 'CUSTOM';
export type SeedDifficulty = 'Dễ' | 'Trung cấp' | 'Khó';

/** One question of a section (direct) or of a group. */
export interface SeedQuestion {
  /** Defaults to `MULTIPLE_CHOICE`. */
  type?: SeedQuestionType;
  /** Question stem — English for TOEIC/IELTS content. */
  q: string;
  /**
   * Concise Vietnamese explanation. For auto-gradable questions it is built
   * with `note()` so it always carries the vocabulary + difficulty notes that
   * have no dedicated column.
   */
  explanation: string;
  /** Answer choices — required for auto-gradable question types. */
  options?: readonly string[];
  /** 0-based index of the correct option — required together with `options`. */
  answer?: number;
  /**
   * Accepted answers of a TEXT question (FILL_BLANK / SHORT_ANSWER): every
   * entry becomes an `exam_options` row flagged `is_correct`, and submit
   * grades the typed `answerText` against them (case/punctuation-insensitive
   * equality). No "/" inside an entry — the FE joins alternatives with "/".
   */
  answers?: readonly string[];
}

/** Shared stimulus of a question group (audio, passage, picture, notes …). */
export interface SeedMaterial {
  type: SeedMaterialType;
  title?: string;
  /** Placeholder (or real) file path — used for AUDIO/IMAGE materials. */
  fileUrl?: string;
  /** Main body — used for TEXT/PASSAGE materials. */
  content?: string;
  /** Transcript of an AUDIO material ("Xem transcript" in the FE). */
  transcript?: string;
}

/** A set of questions that share one or more materials. */
export interface SeedGroup {
  title?: string;
  groupType?: SeedGroupType;
  instructions?: string;
  /**
   * Ordered — the student UI renders `materials[0]` next to each question of
   * the group, so put the material that must be visible FIRST (photo/passage)
   * before secondary ones (audio…).
   */
  materials?: SeedMaterial[];
  questions: SeedQuestion[];
}

export interface SeedSection {
  name: string;
  /** Name of the format section this section links to (must exist in the format). */
  formatSection: string;
  description: string;
  instructions?: string;
  durationSeconds?: number;
  /**
   * Questions without a group. NOTE: the student UI renders a section's
   * direct questions BEFORE its groups, so only put questions here when they
   * must appear first (e.g. TOEIC Reading Part 5 before Parts 6–7).
   */
  questions?: SeedQuestion[];
  /** Question groups, rendered after the direct questions in declaration order. */
  groups?: SeedGroup[];
}

export interface SeedExam {
  title: string;
  /** Must match an exam type that has a format (TOEIC / IELTS). */
  typeName: string;
  /**
   * Tên format của đề (bắt buộc khi một type có nhiều format — ví dụ đề
   * TOEIC Writing dùng "TOEIC Writing Format 2026"). Bỏ trống = format đầu
   * tiên của `typeName` (TOEIC Format 2026 / IELTS Format 2026).
   */
  formatName?: string;
  /** Vietnamese intro shown to the candidate on the detail page. */
  description: string;
  durationSeconds: number;
  isPremium?: boolean;
  sections: SeedSection[];
  /** Integrity check: total question count of the whole exam. */
  expectTotalQuestions: number;
  /** Integrity check: question count per section name. */
  expectSectionQuestions: Record<string, number>;
}

/* ------------------------------------------------------------------ */
/* Authoring helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Builds the Vietnamese explanation of a question, always appending the two
 * notes that have no dedicated column: key vocabulary and difficulty.
 *
 * @param why    short "why the answer is right" text
 * @param vocab  key word/phrase taught by the item ("từ khóa: meaning")
 * @param level  difficulty label
 */
export function note(why: string, vocab: string, level: SeedDifficulty): string {
  return `${why} · Từ vựng: ${vocab} · Trình độ: ${level}`;
}

/** Compact multiple-choice question (3 or 4 options, exactly one correct). */
export function mc(
  q: string,
  options: readonly string[],
  answer: number,
  explanation: string,
): SeedQuestion {
  return { type: 'MULTIPLE_CHOICE', q, options, answer, explanation };
}

/**
 * Open question (completion / short answer / essay …).
 *
 * Pass `answers` (accepted answers, e.g. `['four', '4']`) to give the
 * question an answer key — the server then grades the typed `answerText`
 * against them and counts the question in `totalQuestions`. Without `answers`
 * the question is recorded but never graded.
 */
export function openTask(
  type: Exclude<SeedQuestionType, 'MULTIPLE_CHOICE' | 'MULTI_SELECT' | 'TRUE_FALSE'>,
  q: string,
  explanation: string,
  answers?: readonly string[],
): SeedQuestion {
  if (!answers || answers.length === 0) return { type, q, explanation };
  return { type, q, explanation, answers };
}

/** Total number of questions in an exam content definition. */
export function countExamQuestions(exam: SeedExam): number {
  let total = 0;
  for (const section of exam.sections) {
    total += section.questions?.length ?? 0;
    for (const group of section.groups ?? []) total += group.questions.length;
  }
  return total;
}

/** Question count of one section (direct + grouped). */
export function countSectionQuestions(section: SeedSection): number {
  let total = section.questions?.length ?? 0;
  for (const group of section.groups ?? []) total += group.questions.length;
  return total;
}

/** Total number of question groups in an exam content definition. */
export function countExamGroups(exam: SeedExam): number {
  let total = 0;
  for (const section of exam.sections) total += section.groups?.length ?? 0;
  return total;
}
