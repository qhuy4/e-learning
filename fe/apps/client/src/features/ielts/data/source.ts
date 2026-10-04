import type { Exam } from "../../exams/types";
import { LISTENING_SECTIONS, READING_PASSAGES } from "../constants";
import { getListeningSections as getMockListeningSections } from "../mocks/listening-data";
import { getReadingPassages as getMockReadingPassages } from "../mocks/reading-data";
import { IELTS_SPEAKING_PARTS } from "../mocks/speaking-data";
import { IELTS_WRITING_TASKS } from "../mocks/writing-data";
import { getAllQuestions as getMockAllQuestions } from "../mocks/question-bank";
import type {
  IeltsQuestion,
  ListeningSectionConfig,
  ReadingPassageConfig,
  SpeakingPart,
  WritingTask,
} from "../types";
import { buildIeltsApiSource, type IeltsApiSource } from "./api-source";
import type { ListeningSectionData } from "../mocks/listening-data";
import type { ReadingPassageData } from "../mocks/reading-data";

/**
 * Nguồn dữ liệu đề IELTS.
 *
 * - Mock (mặc định): giữ nguyên dữ liệu demo.
 * - API: provider gọi `syncIeltsApiSource(examId, exam)` ngay trong render
 *   (idempotent) → cài câu hỏi + các config (section/passage/task/part).
 *
 * `LISTENING_SECTIONS` / `READING_PASSAGES` / `IELTS_WRITING_TASKS` /
 * `IELTS_SPEAKING_PARTS` là mảng `const` — ta ghi đè PHẦN NỘI DUNG bên trong
 * (splice) nên mọi consumer đọc trực tiếp (scope, utils, header, navigator…)
 * đều tự nhận dữ liệu thật mà không phải đổi import.
 */

// Snapshot dữ liệu mock để khôi phục khi rời khỏi chế độ API.
const DEFAULT_LISTENING_CONFIGS: ListeningSectionConfig[] = LISTENING_SECTIONS.map((s) => ({
  ...s,
}));
const DEFAULT_READING_CONFIGS: ReadingPassageConfig[] = READING_PASSAGES.map((p) => ({ ...p }));
const DEFAULT_WRITING_TASKS: WritingTask[] = IELTS_WRITING_TASKS.map((task) => ({ ...task }));
const DEFAULT_SPEAKING_PARTS: SpeakingPart[] = IELTS_SPEAKING_PARTS.map((part) => ({
  ...part,
  questions: [...part.questions],
  cue: part.cue ? { ...part.cue, youShouldSay: [...part.cue.youShouldSay] } : undefined,
}));

let installedExamId: number | null = null;
let override: IeltsApiSource | null = null;

function spliceInto<T>(target: T[], values: T[]): void {
  target.splice(0, target.length, ...values);
}

function restoreMockConfigs(): void {
  spliceInto(
    LISTENING_SECTIONS,
    DEFAULT_LISTENING_CONFIGS.map((config) => ({ ...config })),
  );
  spliceInto(
    READING_PASSAGES,
    DEFAULT_READING_CONFIGS.map((config) => ({ ...config })),
  );
  spliceInto(
    IELTS_WRITING_TASKS,
    DEFAULT_WRITING_TASKS.map((task) => ({ ...task })),
  );
  spliceInto(
    IELTS_SPEAKING_PARTS,
    DEFAULT_SPEAKING_PARTS.map((part) => ({
      ...part,
      questions: [...part.questions],
      cue: part.cue ? { ...part.cue, youShouldSay: [...part.cue.youShouldSay] } : undefined,
    })),
  );
}

/** Đồng bộ nguồn theo examId (null = quay về mock). An toàn khi gọi nhiều lần. */
export function syncIeltsApiSource(examId: number | null, exam?: Exam | null): void {
  if (examId === null) {
    if (installedExamId !== null || override !== null) {
      installedExamId = null;
      override = null;
      restoreMockConfigs();
    }
    return;
  }
  if (!exam || installedExamId === examId) return;

  const source = buildIeltsApiSource(exam);
  spliceInto(LISTENING_SECTIONS, source.listeningConfigs);
  spliceInto(READING_PASSAGES, source.readingConfigs);
  spliceInto(IELTS_WRITING_TASKS, source.writingTasks);
  spliceInto(IELTS_SPEAKING_PARTS, source.speakingParts);
  override = source;
  installedExamId = examId;
}

/** Nguồn API đang dùng (null = mock mode). */
export function getIeltsApiSource(): IeltsApiSource | null {
  return override;
}

/** 80 câu Objective — API khi có đề thật, ngược lại dùng mock. */
export function getAllQuestions(): IeltsQuestion[] {
  return override?.questions ?? getMockAllQuestions();
}

/** 4 section Listening (config + stimulus + câu hỏi). */
export function getListeningSections(): ListeningSectionData[] {
  return override?.listeningSections ?? getMockListeningSections();
}

/** 3 passage Reading (config + passage + câu hỏi). */
export function getReadingPassages(): ReadingPassageData[] {
  return override?.readingPassages ?? getMockReadingPassages();
}
