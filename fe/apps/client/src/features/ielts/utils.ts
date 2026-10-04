import type { ExamAnswer } from "../exams/types";
import { LISTENING_SECTIONS, QUESTION_TYPE_META, READING_PASSAGES } from "./constants";
import { getAllQuestions, getIeltsApiSource } from "./data/source";
import { speakingUiId } from "./data/api-source";
import { IELTS_SPEAKING_PARTS } from "./mocks/speaking-data";
import type {
  GroupResult,
  IeltsModule,
  IeltsQuestion,
  IeltsResult,
  IeltsScope,
  SpeakingPart,
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

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function countParagraphs(text: string): number {
  return text
    .split(/\n{1,}/)
    .map((p) => p.trim())
    .filter(Boolean).length;
}

/* ------------------------------------------------------------------ *
 * Answer checking (choice / multi / text / select)
 * ------------------------------------------------------------------ */

export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?"'()]/g, "")
    .replace(/\s+/g, " ");
}

function splitMulti(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean)
    .sort();
}

export function isAnswerCorrect(question: IeltsQuestion, answer: string | undefined): boolean {
  if (!answer || !answer.trim()) return false;
  const control = QUESTION_TYPE_META[question.type].control;

  if (control === "choice" || control === "select") {
    return normalizeAnswer(answer) === normalizeAnswer(question.correct);
  }

  if (control === "multi") {
    const picked = splitMulti(answer);
    const expected = splitMulti(question.correct);
    return (
      picked.length === expected.length && picked.every((letter) => expected.includes(letter))
    );
  }

  // Free text — alternatives are separated by "/".
  const accepted = question.correct.split("/").map(normalizeAnswer);
  return accepted.includes(normalizeAnswer(answer));
}

/* ------------------------------------------------------------------ *
 * IELTS band conversion tables
 * ------------------------------------------------------------------ */

/** Raw score → band, IELTS Academic Listening. */
const LISTENING_BANDS: Array<[number, number]> = [
  [39, 9],
  [37, 8.5],
  [35, 8],
  [32, 7.5],
  [30, 7],
  [26, 6.5],
  [23, 6],
  [18, 5.5],
  [16, 5],
  [13, 4.5],
  [10, 4],
  [8, 3.5],
  [6, 3],
  [4, 2.5],
];

/** Raw score → band, IELTS Academic Reading. */
const READING_BANDS: Array<[number, number]> = [
  [39, 9],
  [37, 8.5],
  [35, 8],
  [33, 7.5],
  [30, 7],
  [27, 6.5],
  [23, 6],
  [19, 5.5],
  [15, 5],
  [13, 4.5],
  [10, 4],
  [8, 3.5],
  [6, 3],
  [4, 2.5],
];

function fromTable(table: Array<[number, number]>, correct: number): number {
  for (const [min, band] of table) {
    if (correct >= min) return band;
  }
  return 0;
}

export function listeningBand(correct: number): number {
  return fromTable(LISTENING_BANDS, correct);
}

export function readingBand(correct: number): number {
  return fromTable(READING_BANDS, correct);
}

/** Rounds to the nearest 0.5 (IELTS band step). */
export function roundBand(value: number): number {
  return Math.round(value * 2) / 2;
}

export function formatBand(value: number): string {
  return Number.isInteger(value) ? `${value}.0` : String(value);
}

/** Writing band estimated from word-count heuristics (labelled "Ước tính"). */
export function estimateWritingBand(drafts: Record<number, string>): number {
  const score = (words: number, min: number): number => {
    if (words <= 0) return 0;
    const ratio = words / min;
    if (ratio >= 1.1) return 7;
    if (ratio >= 1) return 6.5;
    if (ratio >= 0.8) return 6;
    if (ratio >= 0.5) return 5.5;
    if (ratio >= 0.25) return 5;
    return 4.5;
  };
  const scores = [score(countWords(drafts[1] ?? ""), 150), score(countWords(drafts[2] ?? ""), 250)].filter(
    (v) => v > 0,
  );
  if (scores.length === 0) return 0;
  return roundBand(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/** Speaking band estimated from recording + question completion heuristics. */
export function estimateSpeakingBand(
  recordedParts: number,
  answeredQuestions: number,
  totalQuestions: number,
): number {
  const recording = recordedParts / 3;
  const answered = totalQuestions > 0 ? answeredQuestions / totalQuestions : 0;
  const ratio = recording * 0.5 + answered * 0.5;
  if (ratio >= 0.9) return 7;
  if (ratio >= 0.75) return 6.5;
  if (ratio >= 0.6) return 6;
  if (ratio >= 0.45) return 5.5;
  if (ratio >= 0.3) return 5;
  if (ratio >= 0.15) return 4.5;
  if (ratio > 0) return 4;
  return 0;
}

/* ------------------------------------------------------------------ *
 * Speaking per-question recording (mỗi câu MỘT bản ghi) —
 * part được coi "đã ghi âm" khi TẤT cả câu trong part có bản ghi.
 * ------------------------------------------------------------------ */

export function isSpeakingPartRecorded(
  part: SpeakingPart,
  answered: Record<string, boolean>,
): boolean {
  return part.questions.length > 0 && part.questions.every((q) => answered[q.id]);
}

/** Số part Speaking đã ghi âm ĐỦ — nguồn cho "đã ghi âm X/3 part". */
export function recordedSpeakingParts(answered: Record<string, boolean>): number {
  return IELTS_SPEAKING_PARTS.filter((part) => isSpeakingPartRecorded(part, answered)).length;
}

/** Overall = average of the SCORED parts, rounded to the nearest 0.5. */
export function overallBand(parts: number[]): number {
  if (parts.length === 0) return 0;
  return roundBand(parts.reduce((a, b) => a + b, 0) / parts.length);
}

/* ------------------------------------------------------------------ *
 * Result computation (UI demo — no backend)
 * ------------------------------------------------------------------ */

export interface IeltsComputeInput {
  answers: Record<number, string>;
  drafts: Record<number, string>;
  flags: Record<number, boolean>;
  /** Câu Speaking ĐÃ GHI ÂM (qid → true) — mỗi câu một bản ghi. */
  speakingAnswered: Record<string, boolean>;
  timeSpentSec: number;
  speakingQuestionCount: number;
  speakingAnsweredCount: number;
}

function blankGroups(): Record<number, GroupResult> {
  const out: Record<number, GroupResult> = {};
  for (const s of LISTENING_SECTIONS) out[s.section] = { correct: 0, total: s.to - s.from + 1 };
  return out;
}

function blankPassages(): Record<number, GroupResult> {
  const out: Record<number, GroupResult> = {};
  for (const p of READING_PASSAGES) out[p.passage] = { correct: 0, total: p.to - p.from + 1 };
  return out;
}

export function computeIeltsResult(input: IeltsComputeInput): IeltsResult {
  const bySection = blankGroups();
  const byPassage = blankPassages();
  const allQuestions = getAllQuestions();
  // Tổng câu Objective thực tế — đề 1 kỹ năng (Reading-only) chỉ có 40 câu.
  const listeningRawTotal = allQuestions.filter((q) => q.module === "listening").length;
  const readingRawTotal = allQuestions.filter((q) => q.module === "reading").length;
  const objectiveTotal = listeningRawTotal + readingRawTotal;
  let correct = 0;
  let answered = 0;

  for (const q of allQuestions) {
    const picked = input.answers[q.id];
    if (picked && picked.trim()) answered += 1;
    const ok = isAnswerCorrect(q, picked);
    if (!ok) continue;
    correct += 1;
    if (q.module === "listening") {
      const bucket = bySection[q.group];
      if (bucket) bucket.correct += 1;
    } else {
      const bucket = byPassage[q.group];
      if (bucket) bucket.correct += 1;
    }
  }

  const listeningCorrect = LISTENING_SECTIONS.reduce(
    (sum, s) => sum + (bySection[s.section]?.correct ?? 0),
    0,
  );
  const readingCorrect = READING_PASSAGES.reduce(
    (sum, p) => sum + (byPassage[p.passage]?.correct ?? 0),
    0,
  );
  const skipped = Math.max(0, objectiveTotal - answered);
  const wrong = Math.max(0, answered - correct);
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  const writingDone = [1, 2].filter((id) => countWords(input.drafts[id] ?? "") > 0).length;
  const writingBand = estimateWritingBand(input.drafts);
  // Speaking KHÔNG chấm tự động (giáo viên chấm tay) → band chỉ giữ tham chiếu
  // thống kê, KHÔNG tham gia tính Overall.
  const speakingBand = estimateSpeakingBand(
    recordedSpeakingParts(input.speakingAnswered),
    input.speakingAnsweredCount,
    input.speakingQuestionCount,
  );
  const listening = listeningBand(listeningCorrect);
  const reading = readingBand(readingCorrect);

  // Overall = trung bình các kỹ năng CÓ trong đề VÀ đã có dữ liệu chấm
  // (đề Reading-only không cộng Listening = 0; Speaking chờ giáo viên).
  const scoredParts: number[] = [];
  if (listeningRawTotal > 0) scoredParts.push(listening);
  if (readingRawTotal > 0) scoredParts.push(reading);
  if (writingDone > 0) scoredParts.push(writingBand);

  return {
    listeningBand: listening,
    readingBand: reading,
    writingBand,
    speakingBand,
    overallBand: overallBand(scoredParts),
    listeningRaw: { correct: listeningCorrect, total: listeningRawTotal },
    readingRaw: { correct: readingCorrect, total: readingRawTotal },
    bySection,
    byPassage,
    correct,
    wrong,
    skipped,
    answered,
    totalObjective: objectiveTotal,
    accuracy,
    flagged: Object.values(input.flags).filter(Boolean).length,
    writingDone,
    speakingDone: recordedSpeakingParts(input.speakingAnswered),
    timeSpentSec: input.timeSpentSec,
    estimated: true,
  };
}

/* ------------------------------------------------------------------ *
 * Snapshot — survives a hard refresh between review → result
 * ------------------------------------------------------------------ */

export interface IeltsSnapshot {
  answers: Record<number, string>;
  drafts: Record<number, string>;
  flags: Record<number, boolean>;
  /** Ghi chú của học viên theo câu — giữ lại khi xem lại sau thi. */
  notes?: Record<number, string>;
  /** Câu Speaking đã ghi âm (qid → true) của lượt đã nộp. */
  speakingAnswered: Record<string, boolean>;
  /** Transcript per câu Speaking — giữ lại khi xem lại sau F5 (audio blob thì mất). */
  speakingTranscript?: Record<string, string>;
  /** Modules the candidate had started — the result page only reviews those. */
  started?: Record<IeltsModule, boolean>;
  /** Practice scope of the submitted run (deep links like ?section=2). */
  scope?: IeltsScope;
  result: IeltsResult;
  /** Điểm máy chủ trả về khi nộp bài API (attempt.score) — không tự bịa. */
  serverScore?: number;
  /** Id attempt máy chủ (khớp cặp examId:attemptId đã lưu). */
  attemptId?: number;
  /** Exam đề API (snapshot chỉ hợp lệ khi trùng examId). */
  examId?: number;
}

const SNAPSHOT_KEY = "ielts:last-result";

export function saveSubmittedSnapshot(snapshot: IeltsSnapshot): void {
  try {
    window.sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage unavailable (private mode) — result page falls back to demo data */
  }
}

export function loadSubmittedSnapshot(): IeltsSnapshot | null {
  try {
    const raw = window.sessionStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IeltsSnapshot;
    return parsed && parsed.result ? parsed : null;
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
    (["answers", "flags", "drafts", "notes", "speaking"] as const).forEach((kind) =>
      window.sessionStorage.removeItem(autoKey(kind, examId)),
    );
  } catch {
    /* storage unavailable */
  }
}

/* ------------------------------------------------------------------ *
 * Dựng lại bài làm ĐÃ NỘP từ rows của GET attempts/:id/answers —
 * nguồn duy nhất khi xem lại (?review=1) / trang kết quả sau F5.
 * ------------------------------------------------------------------ */

export interface IeltsRebuiltFromRows {
  /** displayId (1–80) → letter (MC) / answerText (text có answer-key). */
  answers: Record<number, string>;
  /** taskId (1|2) → bài luận Writing. */
  drafts: Record<number, string>;
  /** Câu Speaking có transcript (qid → true) + text bản ghi. */
  speakingAnswered: Record<string, boolean>;
  speakingTranscript: Record<string, string>;
  speakingAnsweredCount: number;
  speakingQuestionCount: number;
}

/** Null khi chưa nạp nguồn đề API (đề mock không nộp máy chủ). */
export function rebuildIeltsAnswersFromRows(rows: ExamAnswer[]): IeltsRebuiltFromRows | null {
  const source = getIeltsApiSource();
  if (!source) return null;
  const rowByQid = new Map(rows.map((row) => [row.questionId, row]));

  // Objective: displayId → letter (MC) / answerText (FILL có answer-key).
  const answers: Record<number, string> = {};
  source.objectiveBinding.forEach((entry, displayId) => {
    const row = rowByQid.get(entry.questionId);
    if (!row) return;
    if (entry.kind === "choice") {
      if (row.selectedOptionId == null) return;
      const letter = Object.entries(entry.optionIds ?? {}).find(
        ([, optionId]) => optionId === row.selectedOptionId,
      )?.[0];
      if (letter) answers[displayId] = letter;
    } else if (row.answerText) {
      answers[displayId] = row.answerText;
    }
  });

  // Essay: answerText của câu ESSAY → draft của task tương ứng.
  const drafts: Record<number, string> = {};
  source.writingBinding.forEach((questionId, taskId) => {
    const text = rowByQid.get(questionId)?.answerText;
    if (text && text.trim()) drafts[taskId] = text;
  });

  // Speaking per-question: câu nào có transcript → đã ghi âm (+ dựng lại text).
  // Khóa theo id UI (p{part}q{n}) — binding giữ thứ tự câu, id máy chủ chỉ để
  // tra rowByQid (khớp id câu hỏi mà trang hiển thị / lưu trong transcript).
  const speakingAnswered: Record<string, boolean> = {};
  const speakingTranscript: Record<string, string> = {};
  let speakingAnsweredCount = 0;
  source.speakingBinding.forEach((questionIds, part) => {
    questionIds.forEach((dbQuestionId, index) => {
      const text = (rowByQid.get(dbQuestionId)?.answerText ?? "").trim();
      if (!text) return;
      speakingAnswered[speakingUiId(part, index)] = true;
      speakingTranscript[speakingUiId(part, index)] = text;
      speakingAnsweredCount += 1;
    });
  });
  const speakingQuestionCount = source.speakingParts.reduce(
    (n, part) => n + part.questions.length,
    0,
  );

  return {
    answers,
    drafts,
    speakingAnswered,
    speakingTranscript,
    speakingAnsweredCount,
    speakingQuestionCount,
  };
}
