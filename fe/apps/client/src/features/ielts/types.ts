/** Shared types for the IELTS Computer-Delivered demo module (UI-only). */

export type IeltsModule = "listening" | "reading" | "writing" | "speaking";

/** Modules that are answered question-by-question (Writing/Speaking are free-form). */
export type ObjectiveModule = "listening" | "reading";

/**
 * Per-skill practice scope ("luyện từng phần"): the group ids the candidate is
 * practising — Listening sections, Reading passages, Writing tasks, Speaking parts.
 * A missing / empty entry means "everything" (full module).
 */
export interface IeltsScope {
  listening?: number[];
  reading?: number[];
  writing?: number[];
  speaking?: number[];
}

/* ------------------------------------------------------------------ *
 * Question types — 10 listening + 16 reading (official IELTS CBT set)
 * ------------------------------------------------------------------ */

export type ListeningQuestionType =
  | "multiple-choice"
  | "multiple-selection"
  | "note-completion"
  | "sentence-completion"
  | "summary-completion"
  | "table-completion"
  | "flowchart-completion"
  | "map-labeling"
  | "diagram-labeling"
  | "matching-information";

export type ReadingQuestionType =
  | "true-false-not-given"
  | "yes-no-not-given"
  | "matching-headings"
  | "matching-paragraph-information"
  | "matching-sentence-endings"
  | "matching-features"
  | "matching-names"
  | "multiple-choice"
  | "multiple-answer"
  | "sentence-completion"
  | "summary-completion"
  | "note-completion"
  | "table-completion"
  | "diagram-label-completion"
  | "flowchart-completion"
  | "short-answer";

export type QuestionType = ListeningQuestionType | ReadingQuestionType;

/** How a question type is answered (drives the QuestionInput registry). */
export type AnswerControl = "choice" | "multi" | "text" | "select";

export interface IeltsQuestion {
  /** Globally unique: Listening 1–40, Reading 41–80. */
  id: number;
  /** Number shown to the candidate: 1–40 inside each module. */
  num: number;
  module: ObjectiveModule;
  type: QuestionType;
  /** Listening section 1–4 / Reading passage 1–3. */
  group: number;
  /** Answer constraint, e.g. "NO MORE THAN TWO WORDS AND/OR A NUMBER". */
  instruction?: string;
  stem: string;
  /** Choice options (letters A… derived from index). */
  options?: string[];
  /** Custom choice labels, e.g. roman numerals for Matching Headings. */
  letters?: string[];
  /** Letter(s) for choice questions, accepted text otherwise ("/" = alternatives). */
  correct: string;
  explanation: string;
  vocab?: string[];
  /** Listening — transcript snippet shown in review (Premium-locked). */
  transcript?: string;
  /** Reading — sentence from the passage that supports the answer. */
  evidence?: string;
  /** Reading — paragraph label the question refers to (jump-to target). */
  paragraph?: string;
}

/* ------------------------------------------------------------------ *
 * Listening stimulus (left panel per section)
 * ------------------------------------------------------------------ */

export type StimulusKind = "form" | "map" | "conversation" | "notes";

export interface StimulusLine {
  speaker?: string;
  text: string;
}

export interface ListeningStimulus {
  section: 1 | 2 | 3 | 4;
  kind: StimulusKind;
  title: string;
  /** Short instruction read before the recording starts. */
  instruction: string;
  /** Form / notes lines. `{{n}}` marks the blank for question *n*. */
  body: string[];
  /** Conversation transcripts (section 3) — speakers shown in the panel. */
  lines?: StimulusLine[];
  /** Caption for map / diagram placeholders. */
  figureCaption?: string;
  /** Ảnh map/sơ đồ THẬT từ materials.file_url. */
  figureUrl?: string;
  /** File audio THẬT của section này. */
  audioUrl?: string;
  /** Simulated recording length in seconds. */
  audioDurationSec: number;
}

/* ------------------------------------------------------------------ *
 * Reading passages
 * ------------------------------------------------------------------ */

export interface PassageParagraph {
  label: string;
  text: string;
}

export interface PassageTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface PassageFigure {
  caption: string;
  kind: "diagram" | "flowchart" | "map" | "process";
  /** Ảnh sơ đồ THẬT từ materials.file_url. */
  imageUrl?: string;
}

export interface ReadingPassage {
  passage: 1 | 2 | 3;
  title: string;
  topic: string;
  paragraphs: PassageParagraph[];
  table?: PassageTable;
  figure?: PassageFigure;
  footnote?: string;
}

/* ------------------------------------------------------------------ *
 * Writing / Speaking
 * ------------------------------------------------------------------ */

export interface WritingTask {
  id: 1 | 2;
  label: string;
  title: string;
  prompt: string;
  minWords: number;
  recommendedMinutes: number;
  figure?: {
    kind: "graph" | "table" | "pie" | "bar" | "process" | "map";
    caption: string;
    /** Ảnh chart/map THẬT từ materials.file_url. */
    imageUrl?: string;
  };
  keywords?: string[];
}

export interface SpeakingQuestion {
  id: string;
  text: string;
}

export interface CueCard {
  topic: string;
  youShouldSay: string[];
  notePrompt: string;
  prepSeconds: number;
  speakSeconds: number;
}

export interface SpeakingPart {
  part: 1 | 2 | 3;
  label: string;
  title: string;
  durationMinutes: number;
  introduction: string;
  questions: SpeakingQuestion[];
  cue?: CueCard;
}

/* ------------------------------------------------------------------ *
 * Grouping / result
 * ------------------------------------------------------------------ */

export interface ListeningSectionConfig {
  section: 1 | 2 | 3 | 4;
  label: string;
  title: string;
  typeLabel: string;
  from: number;
  to: number;
}

export interface ReadingPassageConfig {
  passage: 1 | 2 | 3;
  label: string;
  title: string;
  from: number;
  to: number;
}

export interface GroupResult {
  correct: number;
  total: number;
}

export interface IeltsResult {
  listeningBand: number;
  readingBand: number;
  writingBand: number;
  speakingBand: number;
  overallBand: number;
  listeningRaw: GroupResult;
  readingRaw: GroupResult;
  bySection: Record<number, GroupResult>;
  byPassage: Record<number, GroupResult>;
  correct: number;
  wrong: number;
  skipped: number;
  answered: number;
  totalObjective: number;
  accuracy: number;
  flagged: number;
  writingDone: number;
  speakingDone: number;
  timeSpentSec: number;
  /** Writing / Speaking bands come from completion heuristics. */
  estimated: boolean;
}

/* ------------------------------------------------------------------ *
 * Landing / instructions mock contracts
 * ------------------------------------------------------------------ */

export interface IeltsCandidate {
  name: string;
  candidateNumber: string;
  module: string;
  testDate: string;
  examCode: string;
  centre: string;
}

export interface IeltsTestCard {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  skills: string[];
  level: string;
  premium: boolean;
}

export interface IeltsStats {
  lastBand: number;
  bestBand: number;
  attempts: number;
  completion: number;
}
