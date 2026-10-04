import type {
  AnswerControl,
  IeltsModule,
  ListeningSectionConfig,
  QuestionType,
  ReadingPassageConfig,
} from "./types";

/** Official IELTS CBT structure (Listening 40 / Reading 40 / Writing 2 tasks / Speaking 3 parts). */
export const LISTENING_SECTIONS: ListeningSectionConfig[] = [
  { section: 1, label: "Section 1", title: "Everyday conversation", typeLabel: "Form Completion", from: 1, to: 10 },
  { section: 2, label: "Section 2", title: "Monologue — map & diagram", typeLabel: "Map / Diagram Labeling", from: 11, to: 20 },
  { section: 3, label: "Section 3", title: "Academic discussion", typeLabel: "Multiple choice & matching", from: 21, to: 30 },
  { section: 4, label: "Section 4", title: "Academic lecture", typeLabel: "Note Completion", from: 31, to: 40 },
];

export const READING_PASSAGES: ReadingPassageConfig[] = [
  { passage: 1, label: "Passage 1", title: "Questions 1–13", from: 41, to: 53 },
  { passage: 2, label: "Passage 2", title: "Questions 14–27", from: 54, to: 67 },
  { passage: 3, label: "Passage 3", title: "Questions 28–40", from: 68, to: 80 },
];

/** Per-module countdown durations (minutes) + display labels. */
export const MODULE_META: Record<
  IeltsModule,
  { label: string; minutes: number; route: string; short: string }
> = {
  listening: { label: "Listening", minutes: 30, route: "/ielts/test/listening", short: "L" },
  reading: { label: "Reading", minutes: 60, route: "/ielts/test/reading", short: "R" },
  writing: { label: "Writing", minutes: 60, route: "/ielts/test/writing", short: "W" },
  speaking: { label: "Speaking", minutes: 14, route: "/ielts/test/speaking", short: "S" },
};

export const OBJECTIVE_TOTAL = 80;
export const LISTENING_TOTAL = 40;
export const READING_TOTAL = 40;
export const WRITING_TASK_COUNT = 2;
export const SPEAKING_PART_COUNT = 3;

export const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

/** Default option sets for closed question families. */
export const TRUE_FALSE_NOT_GIVEN = ["TRUE", "FALSE", "NOT GIVEN"];
export const YES_NO_NOT_GIVEN = ["YES", "NO", "NOT GIVEN"];

/** Human labels + input control per question type (QuestionInput registry). */
export const QUESTION_TYPE_META: Record<QuestionType, { label: string; control: AnswerControl }> = {
  // Listening
  "multiple-choice": { label: "Multiple Choice", control: "choice" },
  "multiple-selection": { label: "Multiple Selection", control: "multi" },
  "note-completion": { label: "Note Completion", control: "text" },
  "sentence-completion": { label: "Sentence Completion", control: "text" },
  "summary-completion": { label: "Summary Completion", control: "text" },
  "table-completion": { label: "Table Completion", control: "text" },
  "flowchart-completion": { label: "Flow Chart Completion", control: "text" },
  "map-labeling": { label: "Map Labeling", control: "select" },
  "diagram-labeling": { label: "Diagram Labeling", control: "select" },
  "matching-information": { label: "Matching Information", control: "choice" },
  // Reading
  "true-false-not-given": { label: "True / False / Not Given", control: "choice" },
  "yes-no-not-given": { label: "Yes / No / Not Given", control: "choice" },
  "matching-headings": { label: "Matching Headings", control: "choice" },
  "matching-paragraph-information": { label: "Matching Paragraph Information", control: "text" },
  "matching-sentence-endings": { label: "Matching Sentence Endings", control: "choice" },
  "matching-features": { label: "Matching Features", control: "choice" },
  "matching-names": { label: "Matching Names", control: "choice" },
  "multiple-answer": { label: "Multiple Answer", control: "multi" },
  "short-answer": { label: "Short Answer Question", control: "text" },
  "diagram-label-completion": { label: "Diagram Label Completion", control: "text" },
};

/** Which questions belong to which module (global id ranges). */
export function listeningTotalActual(): number {
  // Đề API splice LISTENING_SECTIONS — Reading-only → mảng rỗng → base = 0.
  return LISTENING_SECTIONS.reduce((m, s) => Math.max(m, s.to), 0);
}

export function readingTotalActual(): number {
  const base = listeningTotalActual();
  return READING_PASSAGES.reduce((m, p) => Math.max(m, p.to), base) - base;
}

/** Id toàn cục của câu Reading → số thứ tự hiển thị 1…N. */
export function readingLocalId(id: number): number {
  return id - listeningTotalActual();
}

export function moduleOfQuestion(id: number): IeltsModule {
  return id <= listeningTotalActual() ? "listening" : "reading";
}

export function listeningSectionOf(id: number): ListeningSectionConfig {
  return (
    LISTENING_SECTIONS.find((s) => id >= s.from && id <= s.to) ??
    LISTENING_SECTIONS[LISTENING_SECTIONS.length - 1]
  );
}

export function readingPassageOf(id: number): ReadingPassageConfig {
  return (
    READING_PASSAGES.find((p) => id >= p.from && p.from <= p.to && id <= p.to) ??
    READING_PASSAGES[READING_PASSAGES.length - 1]
  );
}

/** Global id of the first question of a reading passage. */
export function firstIdOfPassage(passage: number): number {
  return READING_PASSAGES.find((p) => p.passage === passage)?.from ?? 41;
}

export function firstIdOfSection(section: number): number {
  return LISTENING_SECTIONS.find((s) => s.section === section)?.from ?? 1;
}
