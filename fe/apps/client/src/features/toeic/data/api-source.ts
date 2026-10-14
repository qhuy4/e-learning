import type { Exam, ExamQuestion, ExamSection } from "../../exams/types";
import type {
  QuestionKind,
  SpeakingTask,
  SpeakingTaskKind,
  StimulusLine,
  ToeicQuestion,
  ToeicStimulus,
  WritingTask,
} from "../types";

/**
 * Adapter: `Exam` (API `/student/exams/:id/detail`) → TOEIC UI model.
 *
 * Đề TOEIC API gồm 7 section = 7 part; Part 5 questions nằm trực tiếp trên
 * section, các part còn lại nằm trong các group (một group = một stimulus:
 * ảnh/hội thoại/talk/đoạn văn). Câu hỏi được đánh số hiển thị tuần tự 1–200
 * đúng như TOEIC_PARTS, và binding lưu questionId/optionId thật để nộp bài.
 *
 * Đề Writing/Speaking (section tên "Writing"/"Speaking", mỗi group = 1 task)
 * được dựng thành writingTasks/speakingTasks + binding taskId → questionId
 * (ESSAY / AUDIO_RECORD) để nộp answerText.
 */

/** Display number (1–200) → server ids để dựng SubmitExamAttemptDto. */
export interface ToeicBindingEntry {
  questionId: number;
  /** Letter ("A"…) → exam_options.id. */
  optionIds: Record<string, number>;
}

export interface ToeicApiSource {
  examId: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  questions: ToeicQuestion[];
  /** Key = số câu hiển thị 1–200. */
  binding: Map<number, ToeicBindingEntry>;
  /** Task Writing/Speaking của đề (rỗng nếu đề không có section đó). */
  writingTasks: WritingTask[];
  speakingTasks: SpeakingTask[];
  /** taskId → questionId (ESSAY) để nộp answerText bài viết. */
  writingBinding: Map<number, number>;
  /** taskId → questionId (AUDIO_RECORD) để nộp answerText task nói. */
  speakingBinding: Map<number, number>;
}

const KIND_BY_PART: Record<number, QuestionKind> = {
  1: "photo",
  2: "response",
  3: "conversation",
  4: "talk",
  5: "incomplete",
  6: "text-completion",
  7: "comprehension",
};

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** Seed note format: "lý do · Từ vựng: X (v) — nghĩa · Trình độ: Dễ". */
export function parseSeededExplanation(raw: string | null | undefined): {
  explanation: string;
  vocab?: string[];
} {
  const text = (raw ?? "").trim();
  if (!text.includes(" · ")) return { explanation: text };
  const kept: string[] = [];
  const vocab: string[] = [];
  for (const segment of text.split(" · ")) {
    const seg = segment.trim();
    if (seg.startsWith("Từ vựng:")) {
      const rest = seg.slice("Từ vựng:".length).trim();
      if (rest) vocab.push(rest);
    } else if (seg) {
      kept.push(seg);
    }
  }
  return { explanation: kept.join(" · "), vocab: vocab.length > 0 ? vocab : undefined };
}

/** "Part 3 - Conversations" → "Conversations"; fallback = chuỗi gốc. */
function stripPrefix(title: string | null | undefined, pattern: RegExp): string {
  const value = (title ?? "").trim();
  return value.replace(pattern, "").trim() || value;
}

function sortById<T extends { position: number }>(items: T[] | undefined): T[] {
  return [...(items ?? [])].sort((a, b) => a.position - b.position);
}

/** Transcript "M: Hello…" → dòng thoại (giữ nguyên khi không có speaker). */
function parseTranscript(transcript: string | null | undefined): StimulusLine[] | undefined {
  if (!transcript) return undefined;
  const lines: StimulusLine[] = [];
  for (const raw of transcript.split(/\r?\n/)) {
    const text = raw.trim();
    if (!text) continue;
    const match = text.match(/^([A-Z][A-Za-z0-9 .'\-]{0,24}?):\s*(.*)$/);
    if (match && match[2]) lines.push({ speaker: match[1].trim(), text: match[2].trim() });
    else lines.push({ text });
  }
  return lines.length > 0 ? lines : undefined;
}

interface PushContext {
  part: number;
  displayId: number;
  /** Kỹ năng thật của section — lấy từ sectionType (fallback Part 1–4/5–7). */
  skill: "listening" | "reading";
}

function pushQuestion(
  out: ToeicApiSource,
  ctx: PushContext,
  question: ExamQuestion,
  stimulusId: string | null,
  stimulus: ToeicStimulus | null,
): void {
  const options = sortById(question.options);
  const contents = options.map((o) => o.content);
  const optionIds: Record<string, number> = {};
  let correct = OPTION_LETTERS[0];
  options.forEach((option, index) => {
    const letter = OPTION_LETTERS[index] ?? String.fromCharCode(65 + index);
    optionIds[letter] = option.id;
    if (option.isCorrect) correct = letter;
  });

  const { explanation, vocab } = parseSeededExplanation(question.explanation);
  out.binding.set(ctx.displayId, { questionId: question.id, optionIds });
  out.questions.push({
    id: ctx.displayId,
    part: ctx.part as ToeicQuestion["part"],
    section: ctx.skill,
    kind: KIND_BY_PART[ctx.part] ?? "incomplete",
    stimulusId,
    stimulus,
    stem: question.question,
    options: contents,
    correct,
    explanation,
    vocab,
  });
}

/** Audio label dạng "Questions 32–34" (hoặc "Question 32" cho 1 câu). */
function audioLabel(first: number, last: number): string {
  return first === last ? `Question ${first}` : `Questions ${first}–${last}`;
}

/**
 * Section → nội dung: Part N (L&R) / Writing / Speaking.
 * Ưu tiên `sectionType` có cấu trúc; dữ liệu cũ chưa có cột → đoán qua tên.
 */
function sectionKindOf(
  section: Pick<ExamSection, "name" | "sectionType">,
): "part" | "writing" | "speaking" {
  const type = (section.sectionType ?? "").trim().toUpperCase();
  if (type === "WRITING") return "writing";
  if (type === "SPEAKING") return "speaking";
  if (type === "LISTENING" || type === "READING") return "part";
  const value = (section.name ?? "").trim().toLowerCase();
  if (value.includes("writing")) return "writing";
  if (value.includes("speaking")) return "speaking";
  return "part";
}

/**
 * Kỹ năng của section Part: đọc từ `sectionType` (LISTENING/READING);
 * fallback dữ liệu cũ — Part 1–4 nghe, Part 5–7 đọc.
 */
function skillOfSection(
  section: Pick<ExamSection, "sectionType">,
  part: number,
): "listening" | "reading" {
  const type = (section.sectionType ?? "").trim().toUpperCase();
  if (type === "LISTENING") return "listening";
  if (type === "READING") return "reading";
  return part <= 4 ? "listening" : "reading";
}

/** Label nhóm "Read a Text Aloud" → kind của SpeakingTask. */
const SPEAKING_KIND_BY_LABEL: Record<string, SpeakingTaskKind> = {
  "read a text aloud": "read-aloud",
  "describe a picture": "describe-picture",
  "respond to questions": "respond",
  "respond using information": "info-response",
  "express an opinion": "opinion",
};

/**
 * Section Writing → task list (mỗi group = 1 task, câu hỏi ESSAY):
 *   - group.title    = "Writing Task N - <English title>" → strip tiền tố → title
 *   - TEXT material  = { title: nhãn type, content: prompt (email có From/Subject) }
 *   - IMAGE material = task có tranh → hasImage
 *   - instructions   = "Yêu cầu: viết ít nhất N từ. Từ khóa: a, b, c." → minWords + keywords
 */
function buildWritingSection(
  section: ExamSection,
): { tasks: WritingTask[]; binding: Map<number, number> } {
  const tasks: WritingTask[] = [];
  const binding = new Map<number, number>();
  let taskId = 0;

  for (const group of sortById(section.groups)) {
    const questions = sortById(group.questions);
    if (questions.length === 0) continue;
    taskId += 1;

    const materials = sortById(group.materials);
    const text = materials.find((m) => m.type === "TEXT");
    const hasImage = materials.some((m) => m.type === "IMAGE");
    const lines = (text?.content ?? "").trim().split(/\r?\n/);

    // Email: "From: …" + "Subject: …" ở đầu → tách header, phần sau = prompt.
    let email: WritingTask["email"];
    let prompt = lines.join("\n").trim();
    if (/^From:/i.test(lines[0] ?? "") && /^Subject:/i.test(lines[1] ?? "")) {
      email = {
        from: lines[0].replace(/^From:\s*/i, "").trim(),
        subject: lines[1].replace(/^Subject:\s*/i, "").trim(),
      };
      prompt = lines.slice(2).join("\n").replace(/^\s*\n+/, "").trim();
    }

    const instructions = group.instructions ?? "";
    const minMatch = instructions.match(/ít nhất\s+(\d+)\s*từ/i);
    const keywordsMatch = instructions.match(/Từ khóa:\s*([^.]+)\.?/i);
    const keywords = keywordsMatch
      ? keywordsMatch[1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    tasks.push({
      id: taskId,
      type: (text?.title ?? "").trim() || "Viết đoạn văn",
      title: stripPrefix(group.title, /^Writing Task \d+\s*-\s*/i),
      prompt,
      minWords: minMatch ? Number(minMatch[1]) : 30,
      ...(keywords.length > 0 ? { keywords } : {}),
      ...(email ? { email } : {}),
      ...(hasImage ? { hasImage: true } : {}),
    });

    // Task có đúng 1 câu ESSAY — gắn questionId thật để nộp answerText.
    const target = questions.find((q) => q.type === "ESSAY") ?? questions[0];
    binding.set(taskId, target.id);
  }

  return { tasks, binding };
}

/**
 * Section Speaking → task list (mỗi group = 1 task, câu hỏi AUDIO_RECORD):
 *   - group.title       = "Speaking Task N - <English label>" → kind + label
 *   - group.instructions = prompt chứa "N seconds to prepare, then M seconds to …"
 *   - TEXT content: info-response có dòng "--" tách info[] / text; còn lại → text
 *   - IMAGE title → imageHint (describe-picture)
 */
function buildSpeakingSection(
  section: ExamSection,
): { tasks: SpeakingTask[]; binding: Map<number, number> } {
  const tasks: SpeakingTask[] = [];
  const binding = new Map<number, number>();
  let taskId = 0;

  for (const group of sortById(section.groups)) {
    const questions = sortById(group.questions);
    if (questions.length === 0) continue;
    taskId += 1;

    const materials = sortById(group.materials);
    const text = materials.find((m) => m.type === "TEXT");
    const image = materials.find((m) => m.type === "IMAGE");
    const label = stripPrefix(group.title, /^Speaking Task \d+\s*-\s*/i);
    const kind = SPEAKING_KIND_BY_LABEL[label.toLowerCase()] ?? "respond";
    const prompt = group.instructions ?? "";

    const prepMatch = prompt.match(/(\d+)\s+seconds?\s+to prepare/i);
    const responseMatch = prompt.match(/then\s+(\d+)\s+seconds?\s+to/i);

    const content = (text?.content ?? "").trim();
    let info: string[] | undefined;
    let taskText = content;
    if (content.includes("\n--\n")) {
      const [rawInfo = "", rawText = ""] = content.split(/\n--\n/);
      info = rawInfo
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      taskText = rawText.trim();
    }

    tasks.push({
      id: taskId,
      kind,
      group: label,
      prompt,
      ...(taskText ? { text: taskText } : {}),
      ...(info ? { info } : {}),
      ...(image?.title ? { imageHint: image.title } : {}),
      prepSec: prepMatch ? Number(prepMatch[1]) : 45,
      responseSec: responseMatch ? Number(responseMatch[1]) : 45,
    });

    // Task có đúng 1 câu AUDIO_RECORD — gắn questionId thật để nộp answerText.
    const target = questions.find((q) => q.type === "AUDIO_RECORD") ?? questions[0];
    binding.set(taskId, target.id);
  }

  return { tasks, binding };
}

function buildStimulus(
  group: NonNullable<ExamSection["groups"]>[number],
  firstDisplay: number,
  lastDisplay: number,
): ToeicStimulus | null {
  const materials = sortById(group.materials);
  const image = materials.find((m) => m.type === "IMAGE") ?? null;
  const audio = materials.find((m) => m.type === "AUDIO") ?? null;
  const passages = materials.filter((m) => m.type === "PASSAGE");

  // Part 6/7: đoạn văn — render từng dòng như mock.
  if (passages.length > 0) {
    const lines: StimulusLine[] = [];
    for (const passage of passages) {
      for (const raw of (passage.content ?? "").split(/\r?\n/)) {
        const text = raw.trimEnd();
        if (text.trim()) lines.push({ text });
      }
    }
    return {
      title: stripPrefix(group.title, /^Part \d+ — [^:]+:\s*/i) || stripPrefix(group.title, /^Part \d+\s*-\s*/i),
      lines: lines.length > 0 ? lines : undefined,
    };
  }

  // Part 1: ảnh + audio.
  if (image) {
    return {
      title: stripPrefix(image.title ?? group.title, /^Ảnh \d+\s*-\s*/i),
      audioLabel: audioLabel(firstDisplay, lastDisplay),
      audioUrl: audio?.fileUrl || undefined,
      imageUrl: image.fileUrl || undefined,
    };
  }

  // Part 2/3/4: audio (Part 3/4 có transcript làm dòng hội thoại).
  return {
    title: stripPrefix(group.title, /^Part \d+\s*(?:-|—)\s*(?:Conversation|Talk|Photograph)s?\s*\d*\s*(?::\s*)?/i) ||
      group.title ||
      "Audio",
    audioLabel: audioLabel(firstDisplay, lastDisplay),
    audioUrl: audio?.fileUrl || undefined,
    lines: parseTranscript(audio?.transcript),
  };
}

export function buildToeicApiSource(exam: Exam): ToeicApiSource {
  const source: ToeicApiSource = {
    examId: exam.id,
    title: exam.title,
    description: exam.description,
    durationMinutes: Math.max(1, Math.round((exam.durationSeconds ?? 7200) / 60)),
    questions: [],
    binding: new Map(),
    writingTasks: [],
    speakingTasks: [],
    writingBinding: new Map(),
    speakingBinding: new Map(),
  };

  const sections = sortById(exam.sections);
  let displayId = 0;

  for (const section of sections) {
    // Section Writing/Speaking (đề thi kỹ năng riêng) → dựng task + binding,
    // KHÔNG đi qua vòng lặp câu hỏi trắc nghiệm (đề kỹ năng không có Part).
    const sectionKind = sectionKindOf(section);
    if (sectionKind === "writing") {
      const built = buildWritingSection(section);
      source.writingTasks = built.tasks;
      source.writingBinding = built.binding;
      continue;
    }
    if (sectionKind === "speaking") {
      const built = buildSpeakingSection(section);
      source.speakingTasks = built.tasks;
      source.speakingBinding = built.binding;
      continue;
    }

    const part = section.position;
    const skill = skillOfSection(section, part);
    // 1) Câu hỏi trực tiếp trên section (Part 5).
    for (const question of sortById(section.questions)) {
      displayId += 1;
      pushQuestion(source, { part, displayId, skill }, question, null, null);
    }

    // 2) Các group — mỗi group = một stimulus chung.
    for (const group of sortById(section.groups)) {
      const questions = sortById(group.questions);
      if (questions.length === 0) continue;
      const firstDisplay = displayId + 1;
      const lastDisplay = displayId + questions.length;
      const stimulus = buildStimulus(group, firstDisplay, lastDisplay);
      const stimulusId = `p${part}-g${group.id}`;
      for (const question of questions) {
        displayId += 1;
        pushQuestion(source, { part, displayId, skill }, question, stimulusId, stimulus);
      }
    }
  }

  return source;
}

/** Cấu trúc task của đề TOEIC — đọc trực tiếp từ đề, dùng cả ngoài provider. */
export interface ToeicTaskStructure {
  /** Đề có section Part N (Listening & Reading). */
  hasParts: boolean;
  writingTasks: WritingTask[];
  speakingTasks: SpeakingTask[];
}

/**
 * Dựng nhanh cấu trúc Writing/Speaking của một đề (mọi task, mọi id thật).
 * Trang landing nằm NGOÀI ToeicExamProvider nên đọc qua hàm thuần này thay vì
 * trạng thái nguồn đã sync trong provider.
 */
export function buildToeicTasks(exam: Exam): ToeicTaskStructure {
  let hasParts = false;
  let writingTasks: WritingTask[] = [];
  let speakingTasks: SpeakingTask[] = [];
  for (const section of sortById(exam.sections)) {
    const kind = sectionKindOf(section);
    if (kind === "writing") writingTasks = buildWritingSection(section).tasks;
    else if (kind === "speaking") speakingTasks = buildSpeakingSection(section).tasks;
    else hasParts = true;
  }
  return { hasParts, writingTasks, speakingTasks };
}
