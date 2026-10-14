import type { PartConfig, ToeicExamConfig, ToeicMode, ToeicSection, WritingTask } from "./types";

/** Official TOEIC Listening & Reading part structure (200 questions). */
export const TOEIC_PARTS: PartConfig[] = [
  { part: 1, section: "listening", label: "Part 1", title: "Photographs", from: 1, to: 6 },
  { part: 2, section: "listening", label: "Part 2", title: "Question-Response", from: 7, to: 31 },
  { part: 3, section: "listening", label: "Part 3", title: "Conversations", from: 32, to: 70 },
  { part: 4, section: "listening", label: "Part 4", title: "Talks", from: 71, to: 100 },
  { part: 5, section: "reading", label: "Part 5", title: "Incomplete Sentences", from: 101, to: 130 },
  { part: 6, section: "reading", label: "Part 6", title: "Text Completion", from: 131, to: 146 },
  { part: 7, section: "reading", label: "Part 7", title: "Reading Comprehension", from: 147, to: 200 },
];

export const SECTION_META: Record<
  ToeicSection,
  { label: string; minutes: number; from: number; to: number }
> = {
  listening: { label: "Listening", minutes: 45, from: 1, to: 100 },
  reading: { label: "Reading", minutes: 75, from: 101, to: 200 },
  writing: { label: "Writing", minutes: 60, from: 1, to: 8 },
  speaking: { label: "Speaking", minutes: 20, from: 1, to: 11 },
};

export const QUESTION_TOTAL = 200;
export const WRITING_TASK_COUNT = 8;
export const SPEAKING_TASK_COUNT = 11;
export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

/** Default setup: full Listening & Reading test, 120 minutes. */
export const DEFAULT_TOEIC_CONFIG: ToeicExamConfig = {
  mode: "lr",
  parts: [],
  tasks: [],
  minutes: 120,
};

/** Default countdown (seconds) per mode before the candidate picks a duration. */
export const DEFAULT_MODE_MINUTES: Record<ToeicMode, number> = {
  lr: 120,
  writing: 60,
  speaking: 20,
};

/** Quick duration presets offered on the setup card. */
export const TIME_PRESETS: Record<ToeicMode, number[]> = {
  lr: [30, 45, 60, 90, 120],
  writing: [20, 40, 60],
  speaking: [10, 15, 20, 30],
};

export const MODE_LABELS: Record<ToeicMode, string> = {
  lr: "Listening & Reading",
  writing: "Writing",
  speaking: "Speaking",
};

/** Derives the active mode from the route (each flow has its own shell). */
export function modeOfPath(pathname: string): ToeicMode {
  if (pathname.includes("/toeic/run")) return "lr";
  if (pathname.includes("/writing")) return "writing";
  if (pathname.includes("/speaking")) return "speaking";
  return "lr";
}

/** Effective part selection (empty config = all 7 parts). */
export function effectiveParts(parts: number[]): number[] {
  return parts.length > 0 ? parts : TOEIC_PARTS.map((p) => p.part);
}

/** How many tasks the given mode contains (L&R has no task concept). */
export function taskCountOf(mode: ToeicMode): number {
  return mode === "writing" ? WRITING_TASK_COUNT : mode === "speaking" ? SPEAKING_TASK_COUNT : 0;
}

/**
 * Effective Writing/Speaking task selection for the active mode
 * (empty config = every task of that mode; L&R mode returns []).
 */
export function effectiveTasks(mode: ToeicMode, tasks: number[]): number[] {
  const count = taskCountOf(mode);
  if (count === 0) return [];
  const valid = [
    ...new Set(tasks.filter((t) => Number.isInteger(t) && t >= 1 && t <= count)),
  ].sort((a, b) => a - b);
  return valid.length > 0 ? valid : Array.from({ length: count }, (_, i) => i + 1);
}

export function partOfQuestion(id: number): PartConfig {
  return (
    TOEIC_PARTS.find((p) => id >= p.from && id <= p.to) ?? TOEIC_PARTS[TOEIC_PARTS.length - 1]
  );
}

export function sectionOfQuestion(id: number): ToeicSection {
  return id <= 100 ? "listening" : "reading";
}

export function isWritingTaskId(id: number): boolean {
  return id >= 1 && id <= WRITING_TASK_COUNT;
}

export type { WritingTask };
