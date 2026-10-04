import {
  DEFAULT_TOEIC_CONFIG,
  SPEAKING_TASK_COUNT,
  TOEIC_PARTS,
  WRITING_TASK_COUNT,
  effectiveParts,
} from "./constants";
import type { ExamAnswer } from "../exams/types";
import { getToeicQuestions } from "./data/source";
import type { ToeicApiSource } from "./data/api-source";
import type {
  QuestionGroup,
  ToeicExamConfig,
  ToeicMode,
  ToeicPartSection,
  ToeicQuestion,
  ToeicResult,
  WritingTask,
} from "./types";

/** "45:00" / "1:15:00" style clock. */
export function formatClock(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Groups consecutive questions that share the same stimulus (conversation / passage). */
export function groupQuestions(questions: ToeicQuestion[]): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  for (const q of questions) {
    const last = groups[groups.length - 1];
    if (last && q.stimulusId && last.stimulusId === q.stimulusId) {
      last.questions.push(q);
    } else {
      groups.push({
        stimulusId: q.stimulusId ?? `q-${q.id}`,
        part: q.part,
        stimulus: q.stimulus,
        questions: [q],
      });
    }
  }
  return groups;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function cefrLevel(total: number): string {
  if (total >= 850) return "C1";
  if (total >= 700) return "B2";
  if (total >= 550) return "B1";
  if (total >= 400) return "A2";
  return "A1";
}

function scaledScore(correct: number, total: number, max: number): number {
  if (total <= 0) return 0;
  return Math.round(((correct / total) * max) / 5) * 5;
}

function allQuestions(): ToeicQuestion[] {
  return getToeicQuestions();
}

/** Question numbers of a section, restricted to the selected parts. */
export function questionIdsFor(
  section: ToeicPartSection,
  parts: number[],
): number[] {
  const selected = new Set(effectiveParts(parts));
  return allQuestions()
    .filter((q) => q.section === section && selected.has(q.part))
    .map((q) => q.id);
}

export interface ComputeToeicOptions {
  /** Simulated speaking recordings (task id → recorded). */
  speaking?: Record<number, boolean>;
  /** Selected parts — empty / undefined means all seven. */
  parts?: number[];
  /** Active mode — scopes Writing / Speaking totals to the chosen tasks. */
  mode?: ToeicMode;
  /** Selected Writing (1–8) / Speaking (1–11) tasks — empty = all tasks. */
  tasks?: number[];
}

/** Computes the score report from the candidate's answers (UI demo — no backend). */
export function computeToeicResult(
  answers: Record<number, string>,
  drafts: Record<number, string>,
  flags: Record<number, boolean> = {},
  options: ComputeToeicOptions = {},
): ToeicResult {
  const { speaking = {}, parts, mode, tasks = [] } = options;
  const selected = new Set(effectiveParts(parts ?? []));

  // Writing / Speaking: only the tasks chosen for the active mode count.
  const taskSel = new Set(
    mode === "writing"
      ? tasks.filter((t) => Number.isInteger(t) && t >= 1 && t <= WRITING_TASK_COUNT)
      : mode === "speaking"
        ? tasks.filter((t) => Number.isInteger(t) && t >= 1 && t <= SPEAKING_TASK_COUNT)
        : [],
  );
  const writingTaskTotal =
    mode === "writing" && taskSel.size > 0 ? taskSel.size : WRITING_TASK_COUNT;
  const speakingTaskTotal =
    mode === "speaking" && taskSel.size > 0 ? taskSel.size : SPEAKING_TASK_COUNT;

  const correctByPart: Record<string, { correct: number; total: number }> = {};
  let listeningCorrect = 0;
  let readingCorrect = 0;
  let listeningTotal = 0;
  let readingTotal = 0;
  let questionTotal = 0;
  let answered = 0;
  let flagged = 0;

  for (const cfg of TOEIC_PARTS) {
    const included = selected.has(cfg.part);
    const size = cfg.to - cfg.from + 1;
    correctByPart[String(cfg.part)] = { correct: 0, total: included ? size : 0 };
    if (!included) continue;
    questionTotal += size;
    if (cfg.section === "listening") listeningTotal += size;
    else readingTotal += size;
  }

  for (const q of allQuestions()) {
    if (!selected.has(q.part)) continue;
    const bucket = correctByPart[String(q.part)];
    if (!bucket) continue;
    if (answers[q.id]) answered += 1;
    if (flags[q.id]) flagged += 1;
    const picked = answers[q.id];
    if (picked && picked === q.correct) {
      bucket.correct += 1;
      if (q.section === "listening") listeningCorrect += 1;
      else readingCorrect += 1;
    }
  }

  const writingDone = Object.entries(drafts).filter(
    ([id, text]) =>
      countWords(text) >= 3 &&
      (mode !== "writing" || taskSel.size === 0 || taskSel.has(Number(id))),
  ).length;
  const speakingDone = Object.entries(speaking).filter(
    ([id, done]) =>
      done && (mode !== "speaking" || taskSel.size === 0 || taskSel.has(Number(id))),
  ).length;

  const listening = scaledScore(listeningCorrect, listeningTotal, 495);
  const reading = scaledScore(readingCorrect, readingTotal, 495);
  const writing = scaledScore(writingDone, writingTaskTotal, 200);
  const speakingScore = scaledScore(speakingDone, speakingTaskTotal, 200);
  const total = Math.min(990, listening + reading + writing + speakingScore);

  return {
    listening,
    reading,
    writing,
    speaking: speakingScore,
    total,
    cefr: cefrLevel(total),
    correctByPart,
    answered,
    flagged,
    writingDone,
    speakingDone,
    writingTaskTotal,
    speakingTaskTotal,
    parts: [...selected].sort((a, b) => a - b),
    questionTotal,
  };
}

export function writingTaskLabel(task: WritingTask): string {
  return `Task ${task.id} · ${task.type}`;
}

/** First page of the flow that matches the chosen setup. */
export function startRouteForConfig(config: ToeicExamConfig): string {
  if (config.mode === "writing") return "/toeic/writing";
  if (config.mode === "speaking") return "/toeic/speaking";
  const parts = effectiveParts(config.parts);
  return parts.some((p) => p <= 4) ? "/toeic/run/listening" : "/toeic/run/reading";
}

/** Snapshot of the final submission, kept between review → result pages. */
export interface SubmittedSnapshot {
  answers: Record<number, string>;
  drafts: Record<number, string>;
  speaking: Record<number, boolean>;
  config: ToeicExamConfig;
  result: ToeicResult;
  /** Điểm máy chủ trả về khi nộp bài API (attempt.score) — không tự bịa. */
  serverScore?: number;
  /** Id attempt máy chủ (khớp cặp examId:attemptId đã lưu). */
  attemptId?: number;
  /** Exam đề API (snapshot chỉ hợp lệ khi trùng examId). */
  examId?: number;
}

const SNAPSHOT_KEY = "toeic:last-result";

export function saveSubmittedSnapshot(snapshot: SubmittedSnapshot): void {
  try {
    window.sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage unavailable (private mode) — result page falls back to demo data */
  }
}

export function loadSubmittedSnapshot(): SubmittedSnapshot | null {
  try {
    const raw = window.sessionStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SubmittedSnapshot>;
    if (!parsed || !parsed.result) return null;
    return {
      answers: parsed.answers ?? {},
      drafts: parsed.drafts ?? {},
      speaking: parsed.speaking ?? {},
      config: parsed.config ?? DEFAULT_TOEIC_CONFIG,
      result: parsed.result,
      serverScore: parsed.serverScore,
      attemptId: parsed.attemptId,
      examId: parsed.examId,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Auto-save — answers/flags/drafts sống trong sessionStorage theo
 * examId: F5 / mất mạng giữa chừng không mất bài làm.
 * ------------------------------------------------------------------ */

function autoKey(kind: string, examId: number | null): string {
  return `exam:auto:${kind}:${examId ?? "mock"}`;
}

export function readAutoSave<T>(kind: string, examId: number | null, fallback: T): T {
  try {
    const raw = window.sessionStorage.getItem(autoKey(kind, examId));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeAutoSave(kind: string, examId: number | null, value: unknown): void {
  try {
    window.sessionStorage.setItem(autoKey(kind, examId), JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) */
  }
}

/** Nộp bài xong → xoá bản lưu để lượt thi mới bắt đầu sạch. */
export function clearAutoSave(examId: number | null): void {
  try {
    (["answers", "flags", "drafts"] as const).forEach((kind) =>
      window.sessionStorage.removeItem(autoKey(kind, examId)),
    );
  } catch {
    /* storage unavailable */
  }
}

/* ------------------------------------------------------------------ *
 * Chế độ xem lại đề thi (?review=1) — dựng lại bài làm ĐÃ NỘP từ
 * `GET /student/exams/attempts/:id/answers` (dùng chung với trang kết
 * quả): answers (số câu hiển thị → letter), drafts, speaking.
 * ------------------------------------------------------------------ */
export function rebuildAnswersFromRows(
  source: ToeicApiSource,
  rows: ExamAnswer[],
): {
  answers: Record<number, string>;
  drafts: Record<number, string>;
  speaking: Record<number, boolean>;
} {
  // questionId → số câu hiển thị (1–200).
  const qidToDisplay = new Map<number, number>();
  source.binding.forEach((entry, displayId) => qidToDisplay.set(entry.questionId, displayId));
  const answers: Record<number, string> = {};
  const drafts: Record<number, string> = {};
  const speaking: Record<number, boolean> = {};
  // binding = Map<taskId, questionId> → Map.forEach(value, key): value là
  // questionId, key là taskId (tên tham số phải đúng thứ tự, không thì map tra
  // ngược taskId→qid và get(row.questionId) luôn undefined → review mất bài).
  const qidToWritingTask = new Map<number, number>();
  source.writingBinding.forEach((questionId, taskId) => qidToWritingTask.set(questionId, taskId));
  const qidToSpeakingTask = new Map<number, number>();
  source.speakingBinding.forEach((questionId, taskId) => qidToSpeakingTask.set(questionId, taskId));

  for (const row of rows) {
    // Writing/Speaking: bài làm thật đã nộp nằm ở answerText.
    const writingTask = qidToWritingTask.get(row.questionId);
    if (writingTask !== undefined && row.answerText) {
      drafts[writingTask] = row.answerText;
      continue;
    }
    const speakingTask = qidToSpeakingTask.get(row.questionId);
    if (speakingTask !== undefined && row.answerText) {
      speaking[speakingTask] = true;
      continue;
    }
    const displayId = qidToDisplay.get(row.questionId);
    if (displayId == null || row.selectedOptionId == null) continue;
    const entry = source.binding.get(displayId);
    if (!entry) continue;
    const letter = Object.entries(entry.optionIds).find(
      ([, optionId]) => optionId === row.selectedOptionId,
    )?.[0];
    if (letter) answers[displayId] = letter;
  }
  return { answers, drafts, speaking };
}
