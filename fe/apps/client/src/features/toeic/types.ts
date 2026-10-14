/** Shared types for the TOEIC CBT demo module (UI-only). */

export type ToeicSection = "listening" | "reading" | "writing" | "speaking";

/** Sections that contain multiple-choice questions (writing/speaking are free-response). */
export type ToeicPartSection = "listening" | "reading";

/** Which test the candidate is taking — each mode runs as its own flow. */
export type ToeicMode = "lr" | "writing" | "speaking";

/** Exam configuration chosen before starting (mode, selected parts, duration). */
export interface ToeicExamConfig {
  mode: ToeicMode;
  /** Selected Listening & Reading parts (1–7). Empty = all parts. */
  parts: number[];
  /** Selected Writing (1–8) / Speaking (1–11) tasks for the active mode. Empty = all tasks. */
  tasks: number[];
  /** Chosen duration in minutes for the active mode. */
  minutes: number;
}

export type SpeakingTaskKind =
  | "read-aloud"
  | "describe-picture"
  | "respond"
  | "info-response"
  | "opinion";

/** One task of the TOEIC Speaking test (11 tasks, ~20 minutes). */
export interface SpeakingTask {
  /** Task number 1–11. */
  id: number;
  kind: SpeakingTaskKind;
  /** Group label, e.g. "Read a Text Aloud". */
  group: string;
  /** Main instruction shown to the candidate. */
  prompt: string;
  /** Text to read aloud / question to answer. */
  text?: string;
  /** Given-information lines (Respond Using Information tasks). */
  info?: string[];
  /** Placeholder description for the picture (UI demo — no real image). */
  imageHint?: string;
  prepSec: number;
  responseSec: number;
}

/** Navigator grouping for the Speaking test. */
export interface SpeakingGroup {
  key: SpeakingTaskKind;
  label: string;
  from: number;
  to: number;
}

export type ToeicPart = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type QuestionKind =
  | "photo"
  | "response"
  | "conversation"
  | "talk"
  | "incomplete"
  | "text-completion"
  | "comprehension";

export interface StimulusLine {
  speaker?: string;
  text: string;
}

/** Audio / passage context shared by a group of questions. */
export interface ToeicStimulus {
  title: string;
  /** Audio label, e.g. "Questions 32–34" (listening only). */
  audioLabel?: string;
  /** File audio THẬT từ materials.file_url (chưa có file → bỏ trống). */
  audioUrl?: string;
  /** Ảnh THẬT từ materials.file_url (Part 1). */
  imageUrl?: string;
  lines?: StimulusLine[];
}

export interface ToeicQuestion {
  /** Global number 1–200. */
  id: number;
  part: ToeicPart;
  section: ToeicPartSection;
  kind: QuestionKind;
  /** Consecutive questions sharing the same stimulus form a group. */
  stimulusId: string | null;
  stimulus: ToeicStimulus | null;
  stem: string;
  options: string[];
  /** Correct letter, e.g. "A". */
  correct: string;
  explanation: string;
  /** Optional extras shown in Review Answer mode. */
  vocab?: string[];
  grammar?: string;
}

export interface WritingTask {
  /** Task number 1–8. */
  id: number;
  type: string;
  title: string;
  prompt: string;
  keywords?: string[];
  email?: { from: string; subject: string };
  minWords: number;
  hasImage?: boolean;
}

export interface PartConfig {
  part: ToeicPart;
  section: ToeicPartSection;
  label: string;
  title: string;
  from: number;
  to: number;
}

export interface QuestionGroup {
  stimulusId: string;
  part: ToeicPart;
  stimulus: ToeicStimulus | null;
  questions: ToeicQuestion[];
}

export interface PartResult {
  correct: number;
  total: number;
}

export interface ToeicResult {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  total: number;
  cefr: string;
  correctByPart: Record<string, PartResult>;
  answered: number;
  flagged: number;
  writingDone: number;
  speakingDone: number;
  /** Writing / Speaking task totals actually selected (absent = all 8 / 11). */
  writingTaskTotal?: number;
  speakingTaskTotal?: number;
  /** Parts included when computing (empty/absent = all 7 parts). */
  parts: number[];
  /** Number of selected multiple-choice questions (scoped to `parts`). */
  questionTotal: number;
}
