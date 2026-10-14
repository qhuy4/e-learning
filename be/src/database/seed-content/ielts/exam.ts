/**
 * seed-content/ielts/exam.ts — shared IELTS section definitions.
 *
 * 4 sections (Listening 40 + Reading 40 + Writing 2 + Speaking 17) dùng chung
 * cho các đề thi riêng từng kỹ năng (skill-exams.ts). Đề IELTS Full 4 kỹ năng
 * đã gỡ khỏi SEED_EXAMS — mỗi đề IELTS giờ là 1 kỹ năng.
 * "Writing" and "Speaking" format sections are created by the orchestrator
 * (data rows — no schema change).
 */
import { SeedSection } from '../types';
import { expectCount } from '../validate';
import { IELTS_LISTENING } from './listening';
import { IELTS_READING } from './reading';
import { IELTS_SPEAKING } from './speaking';
import { IELTS_WRITING } from './writing';

expectCount(
  'IELTS Listening total',
  IELTS_LISTENING.reduce((n, g) => n + g.questions.length, 0),
  40,
);
expectCount(
  'IELTS Reading total',
  IELTS_READING.reduce((n, g) => n + g.questions.length, 0),
  40,
);
expectCount(
  'IELTS Writing total',
  IELTS_WRITING.reduce((n, g) => n + g.questions.length, 0),
  2,
);
expectCount(
  'IELTS Speaking total',
  IELTS_SPEAKING.reduce((n, g) => n + g.questions.length, 0),
  17,
);

const sections: SeedSection[] = [
  {
    name: 'Listening',
    formatSection: 'Listening',
    description:
      'Phần Nghe: 4 section × 10 câu (form completion, map + table, hội thoại, bài giảng). Mỗi section có audio (placeholder) kèm transcript.',
    instructions:
      'Nghe mỗi đoạn tối đa 2 lần. Câu 1-10 điền biểu mẫu; 11-20 bản đồ + bảng; 21-30 trắc nghiệm; 31-40 ghi chú bài giảng.',
    durationSeconds: 1800,
    groups: IELTS_LISTENING,
  },
  {
    name: 'Reading',
    formatSection: 'Reading',
    description:
      'Phần Đọc: 3 bài passage (13 + 13 + 14 = 40 câu) — TFNG, matching headings/information/features, completion, YNNG, diagram, short answer.',
    instructions:
      'Đọc trong 60 phút. Mỗi câu điền/tối đa số từ quy định trong đề. Dạng trắc nghiệm chọn 1 đáp án.',
    durationSeconds: 3600,
    groups: IELTS_READING,
  },
  {
    name: 'Writing',
    formatSection: 'Writing',
    description:
      'Phần Viết: Task 1 (biểu đồ, 150+ từ, 20 phút) + Task 2 (opinion essay, 250+ từ, 40 phút). Ghi bài vào ô trả lời văn bản.',
    instructions:
      'Task 1: mô tả biểu đồ, không nêu ý kiến. Task 2: lập luận quan điểm rõ ràng, có ví dụ.',
    durationSeconds: 3600,
    groups: IELTS_WRITING,
  },
  {
    name: 'Speaking',
    formatSection: 'Speaking',
    description:
      'Phần Nói: 3 phần — Part 1 (10 câu cá nhân), Part 2 (cue card + 1-2 phút nói), Part 3 (6 câu thảo luận sâu). Bấm Ghi âm để trả lời.',
    instructions:
      'Mỗi câu bấm "Bấm ghi âm", trả lời 2-4 câu (Part 2 nói liên tục 1-2 phút). Giọng nói được lưu làm answerText.',
    durationSeconds: 900,
    groups: IELTS_SPEAKING,
  },
];

/** 4 section kỹ năng — tái dùng cho các đề thi riêng từng kỹ năng. */
export const IELTS_SECTIONS = sections;
export const IELTS_LISTENING_SECTION = sections[0];
export const IELTS_READING_SECTION = sections[1];
export const IELTS_WRITING_SECTION = sections[2];
export const IELTS_SPEAKING_SECTION = sections[3];
