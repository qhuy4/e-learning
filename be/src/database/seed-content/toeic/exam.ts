/**
 * seed-content/toeic/exam.ts — the complete TOEIC Listening & Reading exam.
 *
 * Assembles PART1…PART7 (200 questions) into one `SeedExam`:
 *   Part 1–4 → format section "Listening" (100 câu)
 *   Part 5–7 → format section "Reading"   (100 câu)
 * Each part becomes its own `exam_sections` row so the FE can render and
 * grade per-part, mirroring the mock TOEIC module.
 */
import { SeedExam, SeedGroup, SeedSection } from '../types';
import { expectCount } from '../validate';
import { PART1 } from './part1-photographs';
import { PART2 } from './part2-question-response';
import { PART3 } from './part3-conversations';
import { PART4 } from './part4-talks';
import { PART5 } from './part5-incomplete-sentences';
import { PART6 } from './part6-text-completion';
import { PART7 } from './part7-reading';

/* ---- per-part integrity (fail fast before touching the database) ---- */
expectCount('TOEIC Part 1 items', PART1.length, 6);
expectCount('TOEIC Part 2 items', PART2.length, 25);
expectCount('TOEIC Part 3 groups', PART3.length, 13);
expectCount('TOEIC Part 4 groups', PART4.length, 10);
expectCount('TOEIC Part 5 questions', PART5.length, 30);
expectCount('TOEIC Part 6 passages', PART6.length, 4);
expectCount('TOEIC Part 7 groups', PART7.length, 12);

/* --------------------------- group builders --------------------------- */

const part1Groups: SeedGroup[] = PART1.map((item, i) => ({
  title: `Part 1 - Photograph ${i + 1}: ${item.scene}`,
  groupType: 'IMAGE',
  instructions: 'Nghe một câu mô tả ảnh và chọn câu đúng nhất (4 phương án).',
  materials: [
    { type: 'IMAGE', title: `Ảnh ${i + 1} - ${item.scene}`, fileUrl: item.image },
    { type: 'AUDIO', title: `Part 1 audio ${i + 1}`, fileUrl: item.audio },
  ],
  questions: [item.question],
}));

const part2Groups: SeedGroup[] = PART2.map((item, i) => ({
  title: `Part 2 - Question ${i + 1}`,
  groupType: 'AUDIO',
  instructions: 'Nghe câu hỏi và chọn câu trả lời phù hợp nhất (3 phương án).',
  materials: [{ type: 'AUDIO', title: `Part 2 audio ${i + 1}`, fileUrl: item.audio }],
  questions: [item.question],
}));

const part3Groups: SeedGroup[] = PART3.map((group) => ({
  title: group.title,
  groupType: 'AUDIO',
  instructions: 'Nghe đoạn hội thoại (2 người) và trả lời 3 câu hỏi.',
  materials: [
    {
      type: 'AUDIO',
      title: group.title.replace('Part 3 - ', ''),
      fileUrl: group.audio,
      transcript: group.transcript,
    },
  ],
  questions: [...group.questions],
}));

const part4Groups: SeedGroup[] = PART4.map((group) => ({
  title: group.title,
  groupType: 'AUDIO',
  instructions: 'Nghe đoạn phát biểu (1 người) và trả lời 3 câu hỏi.',
  materials: [
    {
      type: 'AUDIO',
      title: group.title.replace('Part 4 - ', ''),
      fileUrl: group.audio,
      transcript: group.transcript,
    },
  ],
  questions: [...group.questions],
}));

const part6Groups: SeedGroup[] = PART6.map((group) => ({
  title: group.title,
  groupType: 'PASSAGE',
  instructions: 'Đọc đoạn văn và chọn từ/cụm từ đúng cho từng chỗ trống (4 câu).',
  materials: [
    {
      type: 'PASSAGE',
      title: `${group.passageType} - ${group.title.split(': ')[1] ?? group.title}`,
      content: group.text,
    },
  ],
  questions: [...group.questions],
}));

const part7Groups: SeedGroup[] = PART7.map((group) => ({
  title: group.title,
  groupType: 'PASSAGE',
  instructions:
    group.kind === 'single'
      ? 'Đọc một văn bản và trả lời câu hỏi.'
      : group.kind === 'double'
        ? 'Đọc hai văn bản liên quan và trả lời câu hỏi.'
        : 'Đọc ba văn bản liên quan và trả lời câu hỏi.',
  materials: group.texts.map((text, i) => ({
    type: 'PASSAGE' as const,
    title:
      group.texts.length === 1
        ? group.title.replace('Part 7 - ', '')
        : `Text ${i + 1}`,
    content: text,
  })),
  questions: [...group.questions],
}));

/* ------------------------------ sections ------------------------------ */

const sections: SeedSection[] = [
  {
    name: 'Part 1 - Photographs',
    formatSection: 'Part 1',
    description: 'Phần 1 - Mô tả ảnh: 6 câu nghe, mỗi câu 4 phương án.',
    instructions: 'Nghe và chọn câu mô tả đúng nhất những gì diễn ra trong ảnh.',
    durationSeconds: 300,
    groups: part1Groups,
  },
  {
    name: 'Part 2 - Question-Response',
    formatSection: 'Part 2',
    description: 'Phần 2 - Hỏi và đáp: 25 câu nghe, mỗi câu 3 phương án.',
    instructions: 'Nghe câu hỏi hoặc lời phát biểu rồi chọn câu trả lời phù hợp nhất.',
    durationSeconds: 750,
    groups: part2Groups,
  },
  {
    name: 'Part 3 - Conversations',
    formatSection: 'Part 3',
    description: 'Phần 3 - Hội thoại: 13 đoạn hội thoại × 3 câu = 39 câu.',
    instructions: 'Nghe mỗi đoạn hội thoại và trả lời 3 câu hỏi liên quan.',
    durationSeconds: 900,
    groups: part3Groups,
  },
  {
    name: 'Part 4 - Talks',
    formatSection: 'Part 4',
    description: 'Phần 4 - Bài nói đơn: 10 đoạn × 3 câu = 30 câu.',
    instructions: 'Nghe mỗi đoạn phát biểu (lời thông báo, quảng cáo, bài giảng…) và trả lời 3 câu hỏi.',
    durationSeconds: 750,
    groups: part4Groups,
  },
  {
    name: 'Part 5 - Incomplete Sentences',
    formatSection: 'Part 5',
    description: 'Phần 5 - Câu chưa hoàn chỉnh: 30 câu, mỗi câu 4 phương án.',
    instructions: 'Chọn từ hoặc cụm từ phù hợp nhất để hoàn thành câu.',
    durationSeconds: 900,
    questions: [...PART5],
  },
  {
    name: 'Part 6 - Text Completion',
    formatSection: 'Part 6',
    description: 'Phần 6 - Hoàn thành đoạn văn: 4 đoạn × 4 chỗ trống = 16 câu.',
    instructions: 'Đọc đoạn văn và chọn phương án đúng cho từng chỗ trống.',
    durationSeconds: 900,
    groups: part6Groups,
  },
  {
    name: 'Part 7 - Reading Comprehension',
    formatSection: 'Part 7',
    description: 'Phần 7 - Đọc hiểu: 12 văn bản (đơn / kép / ba văn bản) = 54 câu.',
    instructions: 'Đọc (các) văn bản và trả lời câu hỏi về nội dung, chi tiết, ý chính.',
    durationSeconds: 2700,
    groups: part7Groups,
  },
];

/* -------------------------------- exam -------------------------------- */

export const TOEIC_LR_EXAM: SeedExam = {
  title: 'TOEIC Listening & Reading - Test 1 (200 câu)',
  typeName: 'TOEIC',
  description:
    'Bài thi thử TOEIC Listening & Reading theo chuẩn format 2026: 200 câu hỏi / 120 phút — ' +
    '100 câu Nghe (Part 1: 6 ảnh, Part 2: 25 hỏi-đáp, Part 3: 13 hội thoại × 3, Part 4: 10 bài nói × 3) và ' +
    '100 câu Đọc (Part 5: 30 câu, Part 6: 4 đoạn × 4, Part 7: 54 câu). ' +
    'Mã đề: TOEIC-LR-2026-01 · Số câu hỏi: 200 · Cấp độ: Trung cấp · Trạng thái: Published · Premium. ' +
    'Mỗi câu có đáp án đúng, giải thích tiếng Anh và ghi chú từ vựng; phần nghe có audio (placeholder) kèm transcript.',
  durationSeconds: 7200,
  isPremium: true,
  sections,
  expectTotalQuestions: 200,
  expectSectionQuestions: {
    'Part 1 - Photographs': 6,
    'Part 2 - Question-Response': 25,
    'Part 3 - Conversations': 39,
    'Part 4 - Talks': 30,
    'Part 5 - Incomplete Sentences': 30,
    'Part 6 - Text Completion': 16,
    'Part 7 - Reading Comprehension': 54,
  },
};
