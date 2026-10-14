import { QuestionType } from "./types";
import type { Exam, ExamQuestion, ExamSection, ExamSectionTag } from "./types";

/** Các dạng câu trả lời văn bản — không có `options`, lưu qua `answerText`. */
const TEXT_ANSWER_TYPES: ReadonlySet<string> = new Set<string>([
  QuestionType.FILL_BLANK,
  QuestionType.SHORT_ANSWER,
  QuestionType.ESSAY,
  QuestionType.AUDIO_RECORD,
]);

/** Kiểu điều khiển React dùng cho từng câu hỏi khi làm bài. */
export type QuestionControlKind = "SINGLE" | "MULTI" | "TEXT" | "UNSUPPORTED";

export function isTextAnswerType(type: string | null | undefined): boolean {
  return typeof type === "string" && TEXT_ANSWER_TYPES.has(type);
}

/**
 * Chọn điều khiển trả lời cho một câu hỏi:
 * - `TEXT`: textarea/input (tự luận, điền chỗ trống, trả lời ngắn),
 * - `MULTI`: checkbox (nhiều đáp án đúng),
 * - `SINGLE`: radio — mọi câu còn lại khi đề cung cấp options,
 * - `UNSUPPORTED`: thiếu options (vd MATCHING) → hộp thông báo, không crash.
 */
export function questionControlKind(
  question: Pick<ExamQuestion, "type" | "options">,
): QuestionControlKind {
  if (isTextAnswerType(question.type)) return "TEXT";
  if (question.type === QuestionType.MULTI_SELECT) return "MULTI";
  if ((question.options ?? []).length > 0) return "SINGLE";
  return "UNSUPPORTED";
}

/** Thông báo trung tính khi câu hỏi chưa có điều khiển trả lời phù hợp. */
export function unsupportedQuestionMessage(type: string | null | undefined): string {
  if (type === QuestionType.TRUE_FALSE) {
    return "Câu hỏi đúng/sai chưa có phương án trả lời — bỏ qua để tiếp tục";
  }
  return "Câu hỏi dạng này chưa được hỗ trợ — bỏ qua để tiếp tục";
}

/** Số từ trong câu trả lời (chip đếm từ của câu tự luận). */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

/** Cắt chuỗi dài để hiển thị gọn trong hộp xác nhận nộp bài. */
export function shortenText(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Gộp mọi câu hỏi của đề (câu trực tiếp + câu trong nhóm) theo thứ tự hiển thị. */
export function collectExamQuestions(sections: ExamSection[] | undefined): ExamQuestion[] {
  const questions: ExamQuestion[] = [];
  for (const section of sections ?? []) {
    questions.push(...(section.questions ?? []));
    for (const group of section.groups ?? []) {
      questions.push(...(group.questions ?? []));
    }
  }
  return questions;
}

/** Nhãn tiếng Việt cho LOẠI đề từ API ("TOEIC" | "IELTS" | "GENERAL"). */
export function examTypeLabel(examTypeName: string | null | undefined): string | null {
  const name = (examTypeName ?? "").trim().toUpperCase();
  if (name === "TOEIC") return "TOEIC";
  if (name === "IELTS") return "IELTS";
  if (name === "GENERAL") return "Đề chung";
  return null;
}

/**
 * Chọn giao diện làm bài theo LOẠI đề (examTypeName từ API):
 * - TOEIC  → module giao diện TOEIC (`/toeic?examId=…`),
 * - IELTS  → module giao diện IELTS (`/ielts?examId=…`),
 * - còn lại (GENERAL / chưa rõ) → giao diện đề chung (`/exams/:id`).
 * `examId` theo query để phase nối API (lấy đề thật, nộp bài) dùng sau.
 */
export function routeForExam(exam: Pick<Exam, "id" | "examTypeName">): string {
  const name = (exam.examTypeName ?? "").trim().toUpperCase();
  if (name === "TOEIC") return `/toeic?examId=${exam.id}`;
  if (name === "IELTS") return `/ielts?examId=${exam.id}`;
  return `/exams/${exam.id}`;
}

/**
 * Suy ra kỹ năng của đề từ TÊN FORMAT (API danh sách không trả `sections`):
 * - TOEIC: format có "Speaking"/"Writing" → đúng kỹ năng đó, còn lại = LR (7 Part),
 * - IELTS: format có tên kỹ năng → kỹ năng đó; format đầy đủ ("IELTS Format")
 *   → cả 4 kỹ năng.
 * Dùng cho chip "Kỹ năng" + bộ lọc kỹ năng trong danh sách đề thi.
 */
export function skillsFromExam(
  exam: Pick<Exam, "examTypeName" | "examFormatName">,
): ExamSectionTag[] {
  const type = (exam.examTypeName ?? "").trim().toUpperCase();
  const format = (exam.examFormatName ?? "").trim().toLowerCase();
  if (type === "TOEIC") {
    if (format.includes("speaking")) return ["SPEAKING"];
    if (format.includes("writing")) return ["WRITING"];
    return ["LR"];
  }
  if (type === "IELTS") {
    const skills: ExamSectionTag[] = [];
    if (format.includes("listening")) skills.push("LISTENING");
    if (format.includes("reading")) skills.push("READING");
    if (format.includes("writing")) skills.push("WRITING");
    if (format.includes("speaking")) skills.push("SPEAKING");
    return skills.length > 0 ? skills : ["LISTENING", "READING", "WRITING", "SPEAKING"];
  }
  return [];
}

/**
 * Kỹ năng của một section — đọc cột `sectionType` (LISTENING/READING/WRITING/
 * SPEAKING) TRƯỚC; chỉ fallback đoán tên khi dữ liệu cũ chưa có cột.
 * Trả về nhãn "Listening" | "Reading" | "Writing" | "Speaking" | "".
 */
export function skillOfSection(section: Pick<ExamSection, "name" | "sectionType">): string {
  const type = (section.sectionType ?? "").trim().toUpperCase();
  if (type === "LISTENING") return "Listening";
  if (type === "READING") return "Reading";
  if (type === "WRITING") return "Writing";
  if (type === "SPEAKING") return "Speaking";
  // Fallback dữ liệu cũ (chưa có section_type): đoán qua tên section.
  const name = (section.name ?? "").trim().toLowerCase();
  if (name.includes("listening")) return "Listening";
  if (name.includes("reading")) return "Reading";
  if (name.includes("writing")) return "Writing";
  if (name.includes("speaking")) return "Speaking";
  return "";
}

/**
 * Tên kỹ năng THẬT có trong đề — đọc từ `sectionType` (fallback tên section
 * với dữ liệu cũ). Dùng cho landing/instructions chỉ hiển thị nút kỹ năng của
 * chính đề đó (vd đề Listening-only → 1 nút "Listening").
 */
export function skillsInSections(sections?: ExamSection[] | null): string[] {
  const found: string[] = [];
  for (const section of sections ?? []) {
    const skill = skillOfSection(section);
    if (skill && !found.includes(skill)) found.push(skill);
  }
  return found;
}

/** Tổng số câu hỏi của đề = câu trực tiếp + câu nằm trong group. */
export function countExamQuestions(sections?: ExamSection[] | null): number {
  return (sections ?? []).reduce(
    (total, section) =>
      total +
      (section.questions?.length ?? 0) +
      (section.groups?.reduce((n, group) => n + (group.questions?.length ?? 0), 0) ?? 0),
    0,
  );
}
