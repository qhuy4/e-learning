import type { Exam } from "../../exams/types";
import type { PartConfig, ToeicQuestion } from "../types";
import { TOEIC_PARTS } from "../constants";
import { TOEIC_WRITING_TASKS, getToeicQuestions as getMockToeicQuestions } from "../mocks/exam-mock";
import { SPEAKING_TASKS } from "../mocks/speaking-mock";
import { buildToeicApiSource, type ToeicApiSource } from "./api-source";

/**
 * Nguồn dữ liệu đề TOEIC.
 *
 * - Mock (mặc định): `getToeicQuestions()` trả về bộ câu hỏi demo như cũ.
 * - API: provider gọi `syncToeicApiSource(examId, exam)` ngay trong render
 *   (idempotent) trước khi children render → mọi consumer đọc qua getter này
 *   đều nhận dữ liệu thật mà không phải chỉnh logic.
 *
 * `TOEIC_WRITING_TASKS` / `SPEAKING_TASKS` là mảng `const` — khi vào API mode
 * ta splice đè nội dung theo đề thật (đề L&R → mảng rỗng), rời API mode thì
 * khôi phục mock. Navigator / header / review / result đọc trực tiếp const
 * nên tự nhận dữ liệu thật.
 */

// Snapshot dữ liệu mock để khôi phục khi rời khỏi chế độ API.
const DEFAULT_WRITING_TASKS = TOEIC_WRITING_TASKS.map((task) => ({ ...task }));
const DEFAULT_SPEAKING_TASKS = SPEAKING_TASKS.map((task) => ({ ...task }));

let installedExamId: number | null = null;
let override: ToeicApiSource | null = null;

function applyMockTaskConfigs(): void {
  TOEIC_WRITING_TASKS.splice(0, TOEIC_WRITING_TASKS.length, ...DEFAULT_WRITING_TASKS);
  SPEAKING_TASKS.splice(0, SPEAKING_TASKS.length, ...DEFAULT_SPEAKING_TASKS);
}

/** Đồng bộ nguồn theo examId (null = quay về mock). An toàn khi gọi nhiều lần. */
export function syncToeicApiSource(examId: number | null, exam?: Exam | null): void {
  if (examId === null) {
    if (installedExamId !== null || override !== null) {
      installedExamId = null;
      override = null;
      applyMockTaskConfigs();
    }
    return;
  }
  if (!exam || installedExamId === examId) return;
  override = buildToeicApiSource(exam);
  installedExamId = examId;
  // Task Writing/Speaking lấy từ chính đề (đề L&R → rỗng = không hiện task ảo).
  TOEIC_WRITING_TASKS.splice(0, TOEIC_WRITING_TASKS.length, ...override.writingTasks);
  SPEAKING_TASKS.splice(0, SPEAKING_TASKS.length, ...override.speakingTasks);
}

/** Nguồn API đang dùng (null = mock mode). */
export function getToeicApiSource(): ToeicApiSource | null {
  return override;
}

/** 200 câu TOEIC — API khi có đề thật, ngược lại dùng mock. */
export function getToeicQuestions(): ToeicQuestion[] {
  return override?.questions ?? getMockToeicQuestions();
}

/**
 * Range 7 Part SUY từ bộ câu hỏi đang dùng (DB hoặc mock) — không hardcode
 * from/to. Part không có câu hỏi thì bỏ qua.
 */
export function getToeicPartRanges(): PartConfig[] {
  const spans = new Map<number, { from: number; to: number }>();
  for (const q of getToeicQuestions()) {
    const cur = spans.get(q.part);
    if (!cur) spans.set(q.part, { from: q.id, to: q.id });
    else {
      cur.from = Math.min(cur.from, q.id);
      cur.to = Math.max(cur.to, q.id);
    }
  }
  const ranges: PartConfig[] = [];
  for (const meta of TOEIC_PARTS) {
    const span = spans.get(meta.part);
    if (!span) continue;
    ranges.push({ ...meta, from: span.from, to: span.to });
  }
  return ranges;
}
