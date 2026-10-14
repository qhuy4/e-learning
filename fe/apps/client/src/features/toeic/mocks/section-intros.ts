import { TOEIC_PARTS, effectiveParts, effectiveTasks } from "../constants";
import type { ToeicExamConfig } from "../types";

/**
 * Intro copy shown on the instructions page — describes the exam the candidate
 * is about to take. The card derives from the live setup config, so it updates
 * as soon as parts / tasks / duration change on the setup card.
 */

export type SectionIntroKey = "listening" | "reading" | "lr" | "writing" | "speaking";

export interface SectionIntroStat {
  label: string;
  value: string;
}

export interface SectionIntro {
  key: SectionIntroKey;
  /** Section name shown in the card title (e.g. "Reading"). */
  section: string;
  /** One paragraph explaining what this section is. */
  summary: string;
  /** Format breakdown: parts, question counts, timing. */
  format: string[];
  /** Practical reminders for the candidate. */
  notes: string[];
}

/** "Part 1–4" / "Part 2, 5" style label for a set of part numbers. */
function partsLabel(parts: number[]): string {
  if (parts.length === 0) return "chưa chọn part nào";
  const sorted = [...parts].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (const part of sorted.slice(1)) {
    if (part === prev + 1) {
      prev = part;
      continue;
    }
    ranges.push(start === prev ? `Part ${start}` : `Part ${start}–${prev}`);
    start = part;
    prev = part;
  }
  ranges.push(start === prev ? `Part ${start}` : `Part ${start}–${prev}`);
  return ranges.join(", ");
}

/** "Task 1–4" / "Task 1, 3, 5" style label for a set of task numbers. */
function tasksLabel(tasks: number[]): string {
  if (tasks.length === 0) return "chưa chọn task nào";
  const sorted = [...tasks].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (const task of sorted.slice(1)) {
    if (task === prev + 1) {
      prev = task;
      continue;
    }
    ranges.push(start === prev ? `Task ${start}` : `Task ${start}–${prev}`);
    start = task;
    prev = task;
  }
  ranges.push(start === prev ? `Task ${start}` : `Task ${start}–${prev}`);
  return ranges.join(", ");
}

function questionsOf(parts: number[]): number {
  const selected = new Set(parts);
  return TOEIC_PARTS.filter((p) => selected.has(p.part)).reduce(
    (sum, p) => sum + (p.to - p.from + 1),
    0,
  );
}

const SECTION_INTROS: Record<SectionIntroKey, SectionIntro> = {
  listening: {
    key: "listening",
    section: "Listening",
    summary:
      "Phần Nghe gồm 100 câu chia làm 4 part (Part 1–4). Audio chạy tự động và mỗi đoạn chỉ phát đúng 1 lần — bạn vừa nghe vừa chọn đáp án ngay trên màn hình.",
    format: [
      "Part 1 — Photographs: 6 câu chọn câu mô tả đúng bức tranh.",
      "Part 2 — Question–Response: 25 câu hỏi – trả lời nhanh với 3 phương án.",
      "Part 3 — Conversations: 13 đoạn hội thoại, mỗi đoạn 3 câu hỏi (39 câu).",
      "Part 4 — Talks: 10 đoạn thông báo / bài phát biểu, mỗi đoạn 3 câu hỏi (30 câu).",
      "Thời gian chính thức khoảng 45 phút, audio chạy liền mạch từ câu đầu đến câu cuối.",
    ],
    notes: [
      "Mỗi đoạn audio chỉ nghe 1 lần — không có nút tua lại hay tạm dừng giữa chừng.",
      "Nghe xong câu nào thì chọn đáp án ngay, phần sau không quay lại phần trước.",
      "Có thể đánh dấu cờ và quay lại trong phạm vi phần Nghe trước khi nộp bài.",
    ],
  },
  reading: {
    key: "reading",
    section: "Reading",
    summary:
      "Phần Đọc gồm 100 câu chia làm 3 part (Part 5–7) trên màn hình, không giới hạn thời gian từng câu — bạn tự phân bổ khoảng 80 phút cho toàn bộ phần.",
    format: [
      "Part 5 — Incomplete Sentences: 30 câu hoàn thành câu (ngữ pháp, từ vựng, giới từ).",
      "Part 6 — Text Completion: 16 câu điền vào đoạn văn / email (4 đoạn × 4 ô trống).",
      "Part 7 — Reading Comprehension: 54 câu đọc hiểu từ 15 đoạn văn (đơn, ghép, email đôi).",
      "Mỗi câu có 4 phương án A–D, chọn đúng 1 đáp án.",
    ],
    notes: [
      "Không có audio ở phần Đọc — mọi thông tin đều nằm trên màn hình.",
      "Gợi ý phân bổ thời gian: Part 5 khoảng 30 giây/câu để dành sức cho Part 7 (đoạn dài).",
      "Đánh dấu cờ cho câu chưa chắc và quay lại kiểm tra trước khi bấm nộp.",
    ],
  },
  lr: {
    key: "lr",
    section: "Listening & Reading",
    summary:
      "Bài thi đầy đủ 200 câu: 100 câu Nghe (Part 1–4) chạy trước với audio, sau đó đến 100 câu Đọc (Part 5–7) trong cùng một lần thi.",
    format: [
      "Listening 100 câu (khoảng 45 phút) → chuyển sang Reading 100 câu (khoảng 75–80 phút).",
      "Đồng hồ đếm ngược dùng chung cho cả hai phần — nếu chọn thời gian ngắn hơn, hãy tự chia giờ hợp lý.",
      "Điểm quy đổi trên thang 990: Listening tối đa 495 + Reading tối đa 495.",
      "Có thể chỉ chọn một vài part nếu muốn luyện chuyên đề thay vì làm trọn bộ.",
    ],
    notes: [
      "Audio Listening phát mỗi đoạn đúng 1 lần, không tua lại được.",
      "Rà lại phần Đọc thật kỹ trước khi nộp — sau khi nộp không thể sửa đáp án.",
      "Bấm “Kiểm tra” âm thanh ở danh sách kiểm tra bên dưới trước khi bắt đầu thi.",
    ],
  },
  writing: {
    key: "writing",
    section: "Writing",
    summary:
      "Writing là bài thi riêng, tách khỏi Listening & Reading: 8 task viết trong khoảng 60 phút, mỗi task có yêu cầu tối thiểu về số từ.",
    format: [
      "Task 1 — Viết 1 câu mô tả tranh (từ 10 từ).",
      "Task 2, 4, 6, 8 — Phản hồi email công việc (từ 30–40 từ).",
      "Task 5 — Viết ghi chú công sở (từ 25 từ).",
      "Task 3, 7 — Bài luận 80+ từ (quan điểm / so sánh).",
      "Đề Writing chạy trên giao diện soạn thảo riêng, hoàn toàn không có audio.",
    ],
    notes: [
      "Kiểm tra số từ trước khi nộp — task dưới mức tối thiểu sẽ không được tính điểm.",
      "Có thể quay lại sửa bài của task trước khi hết giờ.",
      "Chọn task riêng ở thẻ cấu hình nếu chỉ muốn luyện một nhóm task.",
    ],
  },
  speaking: {
    key: "speaking",
    section: "Speaking",
    summary:
      "Speaking là bài thi riêng với 11 task ghi âm bằng mic (khoảng 20 phút), chia thành 5 dạng theo cấu trúc ETS.",
    format: [
      "Read a Text Aloud (Task 1–2): đọc to đoạn văn bản — chuẩn bị 45 giây, trả lời 45 giây.",
      "Describe a Picture (Task 3–4): mô tả bức tranh — chuẩn bị 30 giây, trả lời 45 giây.",
      "Respond to Questions (Task 5–7): trả lời câu hỏi đời thường trong 30 giây.",
      "Respond Using Information (Task 8–10): trả lời bằng dữ liệu cho trước trong 60 giây.",
      "Express an Opinion (Task 11): nêu quan điểm kèm lý do trong 60 giây.",
    ],
    notes: [
      "Micro chỉ ghi âm trong thời gian trả lời — thời gian chuẩn bị không được tính.",
      "Ghi âm bằng mic trình duyệt: nói rõ, đủ ý (mở đầu → chi tiết → kết luận) thay vì nói nhanh — nghe lại được ngay sau khi dừng ghi.",
      "Có thể ghi lại trước khi sang task tiếp theo.",
    ],
  },
};

export interface ResolvedSectionIntro {
  intro: SectionIntro;
  /** Quick facts of the current selection (số câu / task, phạm vi, thời gian). */
  stats: SectionIntroStat[];
  /** Human-readable label of the selected parts / tasks. */
  scope: string;
}

/**
 * Derives the intro card from the live setup:
 * · mode = writing → Writing · mode = speaking → Speaking
 * · mode = lr → parts all in 5–7 = Reading · all in 1–4 = Listening · otherwise L&R
 */
export function resolveSectionIntro(config: ToeicExamConfig): ResolvedSectionIntro {
  const timeStat: SectionIntroStat = { label: "Thời gian", value: `${config.minutes} phút` };

  if (config.mode === "writing") {
    const tasks = effectiveTasks("writing", config.tasks);
    return {
      intro: SECTION_INTROS.writing,
      stats: [
        { label: "Số task", value: `${tasks.length}/8 task` },
        { label: "Phạm vi", value: tasksLabel(tasks) },
        timeStat,
      ],
      scope: tasksLabel(tasks),
    };
  }

  if (config.mode === "speaking") {
    const tasks = effectiveTasks("speaking", config.tasks);
    return {
      intro: SECTION_INTROS.speaking,
      stats: [
        { label: "Số task", value: `${tasks.length}/11 task` },
        { label: "Phạm vi", value: tasksLabel(tasks) },
        timeStat,
      ],
      scope: tasksLabel(tasks),
    };
  }

  // Listening & Reading mode — scoped by the selected parts (empty = all 7).
  const parts = effectiveParts(config.parts);
  const listeningParts = parts.filter((p) => p <= 4);
  const readingParts = parts.filter((p) => p >= 5);
  const key: SectionIntroKey =
    readingParts.length > 0 && listeningParts.length === 0
      ? "reading"
      : listeningParts.length > 0 && readingParts.length === 0
        ? "listening"
        : "lr";
  const questionCount = questionsOf(parts);

  return {
    intro: SECTION_INTROS[key],
    stats: [
      { label: "Số câu hỏi", value: `${questionCount} câu` },
      { label: "Phạm vi", value: partsLabel(parts) },
      timeStat,
    ],
    scope: partsLabel(parts),
  };
}
