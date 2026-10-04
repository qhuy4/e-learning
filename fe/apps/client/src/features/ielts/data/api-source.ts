import type { Exam, ExamQuestion, ExamSection } from "../../exams/types";
import type { ListeningSectionData } from "../mocks/listening-data";
import type { ReadingPassageData } from "../mocks/reading-data";
import type {
  CueCard,
  IeltsQuestion,
  ListeningSectionConfig,
  ListeningStimulus,
  ObjectiveModule,
  PassageParagraph,
  QuestionType,
  ReadingPassage,
  ReadingPassageConfig,
  ReadingQuestionType,
  SpeakingPart,
  SpeakingQuestion,
  StimulusKind,
  WritingTask,
} from "../types";

/**
 * Adapter: `Exam` (API `/student/exams/:id/detail`) → mô hình UI IELTS.
 *
 * Đề IELTS API: 4 section (Listening/Reading/Writing/Speaking) = 12 group.
 * Listening 40 câu (FILL + MC), Reading 40 câu (MC + FILL + SHORT, keys dạng
 * đáp án đúng), Writing 2 ESSAY, Speaking 17 AUDIO_RECORD. `objectiveBinding`
 * lưu questionId/optionId thật (MC) hoặc questionId (text có answer-key) để
 * nộp bài; writing/speaking binding nối transcript/essay về question thật.
 */

export interface IeltsObjectiveBindingEntry {
  questionId: number;
  /** choice = trắc nghiệm (chọn letter), text = điền/short (answerText). */
  kind: "choice" | "text";
  optionIds?: Record<string, number>;
}

export interface IeltsApiSource {
  examId: number;
  title: string;
  description: string | null;
  durationSeconds: number;
  /** 80 câu Objective: Listening 1–40, Reading 41–80. */
  questions: IeltsQuestion[];
  listeningSections: ListeningSectionData[];
  readingPassages: ReadingPassageData[];
  writingTasks: WritingTask[];
  speakingParts: SpeakingPart[];
  listeningConfigs: ListeningSectionConfig[];
  readingConfigs: ReadingPassageConfig[];
  /** Key = id câu hiển thị (1–80). */
  objectiveBinding: Map<number, IeltsObjectiveBindingEntry>;
  /** taskId (1|2) → questionId của câu ESSAY. */
  writingBinding: Map<number, number>;
  /** part (1–3) → questionId theo thứ tự câu hỏi trong part. */
  speakingBinding: Map<number, number[]>;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const LISTENING_AUDIO_SEC = [96, 108, 132, 150];
const SPEAKING_DURATION_MIN = [5, 4, 5];
const CHOICE_TYPES = new Set<QuestionType>([
  "multiple-choice",
  "true-false-not-given",
  "yes-no-not-given",
]);

function sortById<T extends { position: number }>(items: T[] | undefined): T[] {
  return [...(items ?? [])].sort((a, b) => a.position - b.position);
}

/** Seed note format: "lý do · Từ vựng: X (v) — nghĩa · Trình độ: Dễ". */
function parseSeededExplanation(raw: string | null | undefined): {
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

function cleanTitle(title: string | null | undefined, pattern: RegExp): string {
  const value = (title ?? "").trim();
  return value.replace(pattern, "").trim() || value;
}

function stripTrailingCount(value: string): string {
  return value.replace(/\s*\(\d+\s+questions?\)\s*$/i, "").trim();
}

function findSection(exam: Exam, name: RegExp): ExamSection | null {
  return sortById(exam.sections).find((section) => name.test(section.name)) ?? null;
}

/**
 * Tìm section theo KỸ NĂNG có cấu trúc (`sectionType`: LISTENING/READING/…).
 * Dữ liệu mới không cần so khớp tên; dữ liệu cũ chưa có cột → fallback regex tên.
 */
function findSectionByType(
  exam: Exam,
  sectionType: string,
  name: RegExp,
): ExamSection | null {
  const byType =
    sortById(exam.sections).find(
      (section) => (section.sectionType ?? "").trim().toUpperCase() === sectionType,
    ) ?? null;
  return byType ?? findSection(exam, name);
}

function instructionFor(type: QuestionType): string {
  switch (type) {
    case "true-false-not-given":
      return "Do the statements agree with the information in the passage? TRUE / FALSE / NOT GIVEN.";
    case "yes-no-not-given":
      return "Does the writer agree with these claims? YES / NO / NOT GIVEN.";
    default:
      return type === "multiple-choice"
        ? "Choose the correct letter, A–D."
        : "Write NO MORE THAN TWO WORDS AND/OR A NUMBER.";
  }
}

/** Câu hỏi Objective → IeltsQuestion + binding (đúng hợp đồng chấm của BE). */
function adaptObjective(
  raw: ExamQuestion,
  opts: {
    id: number;
    num: number;
    module: ObjectiveModule;
    group: number;
    type: QuestionType;
    transcript?: string;
  },
): { question: IeltsQuestion; binding: IeltsObjectiveBindingEntry } {
  const options = sortById(raw.options);
  const { explanation, vocab } = parseSeededExplanation(raw.explanation);
  const base: Omit<IeltsQuestion, "options" | "correct"> = {
    id: opts.id,
    num: opts.num,
    module: opts.module,
    type: opts.type,
    group: opts.group,
    instruction: instructionFor(opts.type),
    stem: raw.question,
    explanation,
    vocab,
    transcript: opts.transcript,
  };

  // Trắc nghiệm (MC/TFNG/YNNG) → letter + selectedOptionId;
  // các type text (điền/short — kể cả có answer-key) → answerText.
  const isChoice = CHOICE_TYPES.has(opts.type);

  if (isChoice && options.length > 0) {
    const optionIds: Record<string, number> = {};
    let correct = OPTION_LETTERS[0];
    const contents = options.map((option, index) => {
      const letter = OPTION_LETTERS[index] ?? String.fromCharCode(65 + index);
      optionIds[letter] = option.id;
      if (option.isCorrect) correct = letter;
      return option.content;
    });
    return {
      question: { ...base, options: contents, correct },
      binding: { questionId: raw.id, kind: "choice", optionIds },
    };
  }

  // Text có answer-key (đúng/sai chấm theo options is_correct) → join "/".
  const keyed = options.filter((option) => option.isCorrect).map((option) => option.content);
  const correct = keyed.length > 0 ? keyed.join("/") : "";
  return {
    question: { ...base, correct },
    binding: { questionId: raw.id, kind: "text" },
  };
}

/* ------------------------------------------------------------------ *
 * Listening
 * ------------------------------------------------------------------ */

function listeningQuestionType(section: number, raw: ExamQuestion): QuestionType {
  if (raw.type === "MULTIPLE_CHOICE") return "multiple-choice";
  if (section === 2) return "table-completion";
  return "note-completion";
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function parenthetical(title: string, fallback: string): string {
  const match = title.match(/\(([^)]+)\)\s*$/);
  return match ? titleCase(match[1]) : fallback;
}

function buildListening(
  section: ExamSection,
  source: IeltsApiSource,
): void {
  const configs: ListeningSectionConfig[] = [];
  const groups = sortById(section.groups);
  let cursor = 1;

  groups.forEach((group, index) => {
    const groupNumber = (index + 1) as 1 | 2 | 3 | 4;
    const rawQuestions = sortById(group.questions);
    if (rawQuestions.length === 0) return;
    const from = cursor;
    const to = cursor + rawQuestions.length - 1;
    cursor = to + 1;

    const audio = sortById(group.materials).find((m) => m.type === "AUDIO") ?? null;
    const image = sortById(group.materials).find((m) => m.type === "IMAGE") ?? null;
    const transcript = audio?.transcript ?? undefined;
    const title = cleanTitle(group.title, /^Listening Section \d+\s*-\s*/i);

    const kind: StimulusKind =
      groupNumber === 1 ? "form" : groupNumber === 2 ? "map" : groupNumber === 3 ? "conversation" : "notes";

    const questions: IeltsQuestion[] = [];
    rawQuestions.forEach((raw, qIndex) => {
      const id = from + qIndex;
      const { question, binding } = adaptObjective(raw, {
        id,
        num: id,
        module: "listening",
        group: groupNumber,
        type: listeningQuestionType(groupNumber, raw),
        transcript,
      });
      questions.push(question);
      source.objectiveBinding.set(id, binding);
    });

    // Panel "form/notes": danh sách câu có ô nhảy {{n}} — KHÔNG lộ transcript.
    const body = questions.map((q) => `{{${q.id}}} — ${q.stem}`);

    const stimulus: ListeningStimulus = {
      section: groupNumber,
      kind,
      title,
      instruction:
        group.instructions ??
        "Nghe kỹ audio (chỉ phát tối đa 2 lần) và trả lời các câu hỏi trong section này.",
      body,
      figureCaption: image?.title ?? undefined,
      figureUrl: image?.fileUrl || undefined,
      audioUrl: audio?.fileUrl || undefined,
      audioDurationSec: LISTENING_AUDIO_SEC[index] ?? 120,
    };

    source.listeningSections.push({
      config: {
        section: groupNumber,
        label: `Section ${groupNumber}`,
        title,
        typeLabel: parenthetical(title, "Section completion"),
        from,
        to,
      },
      stimulus,
      questions,
    });
    configs.push(source.listeningSections[source.listeningSections.length - 1].config);
  });

  source.listeningConfigs.push(...configs);
}

/* ------------------------------------------------------------------ *
 * Reading
 * ------------------------------------------------------------------ */

function readingQuestionType(
  passage: number,
  raw: ExamQuestion,
  optionContents: string[],
): ReadingQuestionType {
  if (raw.type === "SHORT_ANSWER") return "short-answer";
  if (raw.type === "MULTIPLE_CHOICE") {
    const set = new Set(optionContents.map((value) => value.trim().toUpperCase()));
    if (set.has("NOT GIVEN") && set.has("TRUE")) return "true-false-not-given";
    if (set.has("NOT GIVEN") && set.has("YES")) return "yes-no-not-given";
    return "multiple-choice";
  }
  if (passage === 1) return "sentence-completion";
  if (passage === 2) return "summary-completion";
  return "diagram-label-completion";
}

/** "TITLE\n\nA. đoạn...\n\nB. đoạn..." → tiêu đề + các đoạn có nhãn A./B./… */
function parsePassageContent(content: string | null | undefined): {
  title: string;
  paragraphs: PassageParagraph[];
} {
  const lines = (content ?? "").split(/\r?\n/);
  const title = (lines.find((line) => line.trim()) ?? "Reading passage").trim();
  const paragraphs: PassageParagraph[] = [];
  let current: PassageParagraph | null = null;
  let started = false;
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z])\.\s+(.*)$/);
    if (match) {
      started = true;
      current = { label: match[1], text: match[2].trim() };
      paragraphs.push(current);
    } else if (started && current && line.trim()) {
      current.text = `${current.text} ${line.trim()}`;
    }
  }
  return { title, paragraphs };
}

function buildReading(section: ExamSection, source: IeltsApiSource): void {
  const configs: ReadingPassageConfig[] = [];
  const groups = sortById(section.groups);
  // Số câu Listening THẬT (0 nếu không có Listening) — không hardcode 40.
  const listeningBase = source.listeningConfigs.reduce(
    (max, cfg) => Math.max(max, cfg.to),
    0,
  );
  let cursor = listeningBase + 1;

  groups.forEach((group, index) => {
    const passage = (index + 1) as 1 | 2 | 3;
    const rawQuestions = sortById(group.questions);
    if (rawQuestions.length === 0) return;
    const from = cursor;
    const to = cursor + rawQuestions.length - 1;
    cursor = to + 1;

    const materials = sortById(group.materials);
    const passageMaterial = materials.find((m) => m.type === "PASSAGE") ?? null;
    const image = materials.find((m) => m.type === "IMAGE") ?? null;
    const parsed = parsePassageContent(passageMaterial?.content);
    const topic = stripTrailingCount(cleanTitle(group.title, /^Reading Passage \d+\s*-\s*/i));

    const readingPassage: ReadingPassage = {
      passage,
      title: parsed.title,
      topic,
      paragraphs: parsed.paragraphs,
      figure: image
        ? {
            kind: "diagram",
            caption: image.title ?? "Sơ đồ minh họa",
            imageUrl: image.fileUrl || undefined,
          }
        : undefined,
    };

    const questions: IeltsQuestion[] = [];
    rawQuestions.forEach((raw, qIndex) => {
      const id = from + qIndex;
      const options = sortById(raw.options);
      const contents = options.map((option) => option.content);
      const { question, binding } = adaptObjective(raw, {
        id,
        num: id - listeningBase,
        module: "reading",
        group: passage,
        type: readingQuestionType(passage, raw, contents),
      });
      questions.push(question);
      source.objectiveBinding.set(id, binding);
    });

    source.readingPassages.push({
      config: {
        passage,
        label: `Passage ${passage}`,
        title: `Questions ${from - listeningBase}–${to - listeningBase}`,
        from,
        to,
      },
      passage: readingPassage,
      questions,
    });
    configs.push(source.readingPassages[source.readingPassages.length - 1].config);
  });

  source.readingConfigs.push(...configs);
}

/* ------------------------------------------------------------------ *
 * Writing / Speaking
 * ------------------------------------------------------------------ */

function parseMinWords(prompt: string, fallback: number): number {
  const match = prompt.match(/at least\s+(\d+)\s+words/i);
  const value = match ? Number(match[1]) : NaN;
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function parseMinutes(instructions: string | null | undefined, fallback: number): number {
  const match = (instructions ?? "").match(/~(\d+)\s*phút/);
  const value = match ? Number(match[1]) : NaN;
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function buildWriting(section: ExamSection, source: IeltsApiSource): void {
  sortById(section.groups).forEach((group, index) => {
    const taskId = index + 1;
    const materials = sortById(group.materials);
    const text = materials.find((m) => m.type === "TEXT") ?? null;
    const image = materials.find((m) => m.type === "IMAGE") ?? null;
    const prompt = text?.content?.trim() ?? group.instructions?.trim() ?? "";
    const essay = sortById(group.questions).find((q) => q.type === "ESSAY") ?? null;

    const task: WritingTask = {
      id: taskId as 1 | 2,
      label: `Task ${taskId}`,
      title: cleanTitle(group.title, /^Writing Task \d+\s*-\s*/i) || `Writing Task ${taskId}`,
      prompt,
      minWords: parseMinWords(prompt, taskId === 1 ? 150 : 250),
      recommendedMinutes: parseMinutes(group.instructions, taskId === 1 ? 20 : 40),
      figure: image
        ? {
            kind: taskId === 1 ? "graph" : "map",
            caption: image.title ?? "Hình minh họa",
            imageUrl: image.fileUrl || undefined,
          }
        : undefined,
    };
    source.writingTasks.push(task);
    if (essay) source.writingBinding.set(taskId, essay.id);
  });
}

/** Cue card: "topic / You should say: - bullet… / You will have to talk…" */
function parseCueCard(content: string | null | undefined): CueCard {
  const lines = (content ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const topic = lines[0] ?? "Cue card";
  const sayIndex = lines.findIndex((line) => /you should say/i.test(line));
  const youShouldSay: string[] = [];
  if (sayIndex >= 0) {
    for (let i = sayIndex + 1; i < lines.length; i += 1) {
      if (lines[i].startsWith("-")) {
        youShouldSay.push(lines[i].replace(/^-\s*/, ""));
      } else if (youShouldSay.length > 0) {
        break;
      }
    }
  }
  const notePrompt =
    lines.find((line) => /^you will have to talk/i.test(line)) ??
    "You have one minute to make notes. You will then speak for 1–2 minutes.";
  return {
    topic,
    youShouldSay:
      youShouldSay.length > 0 ? youShouldSay : ["where it is", "what happens there", "why it matters"],
    notePrompt,
    prepSeconds: 60,
    speakSeconds: 120,
  };
}

/**
 * ID câu Speaking dạng UI (`p{part}q{n}`) — khóa của transcript / speakingAnswered
 * ở FE. Binding (`speakingBinding`: part → [questionId máy chủ]) giữ NGUYÊN thứ tự
 * câu trong group, nên câu thứ `index` của part tương ứng questionId[index];
 * dùng id máy chủ trực tiếp làm khóa sẽ không khớp với id UI mà trang hiển thị.
 */
export function speakingUiId(part: number, index: number): string {
  return `p${part}q${index + 1}`;
}

function buildSpeaking(section: ExamSection, source: IeltsApiSource): void {
  sortById(section.groups).forEach((group, index) => {
    const part = (index + 1) as 1 | 2 | 3;
    const rawQuestions = sortById(group.questions);
    const questions: SpeakingQuestion[] = rawQuestions.map((raw, qIndex) => ({
      id: speakingUiId(part, qIndex),
      text: raw.question,
    }));
    const text = sortById(group.materials).find((m) => m.type === "TEXT") ?? null;

    const partData: SpeakingPart = {
      part,
      label: `Part ${part}`,
      title: cleanTitle(group.title, /^Speaking Part \d+\s*-\s*/i) || `Part ${part}`,
      durationMinutes: SPEAKING_DURATION_MIN[index] ?? 5,
      introduction: group.instructions ?? "",
      questions,
      cue: part === 2 && text ? parseCueCard(text.content) : undefined,
    };
    source.speakingParts.push(partData);
    source.speakingBinding.set(
      part,
      rawQuestions.map((raw) => raw.id),
    );
  });
}

/* ------------------------------------------------------------------ *
 * Entry
 * ------------------------------------------------------------------ */

export function buildIeltsApiSource(exam: Exam): IeltsApiSource {
  const source: IeltsApiSource = {
    examId: exam.id,
    title: exam.title,
    description: exam.description,
    durationSeconds: exam.durationSeconds ?? 9600,
    questions: [],
    listeningSections: [],
    readingPassages: [],
    writingTasks: [],
    speakingParts: [],
    listeningConfigs: [],
    readingConfigs: [],
    objectiveBinding: new Map(),
    writingBinding: new Map(),
    speakingBinding: new Map(),
  };

  const listeningSection = findSectionByType(exam, "LISTENING", /listening/i);
  const readingSection = findSectionByType(exam, "READING", /reading/i);
  const writingSection = findSectionByType(exam, "WRITING", /writing/i);
  const speakingSection = findSectionByType(exam, "SPEAKING", /speaking/i);

  if (listeningSection) buildListening(listeningSection, source);
  if (readingSection) buildReading(readingSection, source);
  if (writingSection) buildWriting(writingSection, source);
  if (speakingSection) buildSpeaking(speakingSection, source);

  source.questions = [
    ...source.listeningSections.flatMap((section) => section.questions),
    ...source.readingPassages.flatMap((entry) => entry.questions),
  ];

  return source;
}
