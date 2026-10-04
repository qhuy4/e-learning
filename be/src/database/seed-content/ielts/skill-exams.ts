/**
 * seed-content/ielts/skill-exams.ts — 4 đề IELTS riêng từng kỹ năng.
 *
 * Mỗi đề tái dùng đúng section của đề Full (cùng nội dung thật — 40 câu
 * Listening, 40 câu Reading, 2 task Writing, 17 câu Speaking) nhưng tách thành
 * đề độc lập với format riêng, để học viên thi đúng một kỹ năng.
 */
import { SeedExam } from '../types';
import {
  IELTS_LISTENING_SECTION,
  IELTS_READING_SECTION,
  IELTS_SPEAKING_SECTION,
  IELTS_WRITING_SECTION,
} from './exam';

export const IELTS_LISTENING_EXAM: SeedExam = {
  title: 'IELTS Listening - Test 1 (40 câu, 4 section)',
  typeName: 'IELTS',
  formatName: 'IELTS Listening Format 2026',
  description:
    'Bài thi IELTS Listening một mình: 40 câu trong 30 phút — Section 1 form completion, ' +
    'Section 2 bản đồ + bảng, Section 3 hội thoại học thuật, Section 4 bài giảng. ' +
    'Mỗi section có audio (placeholder) kèm transcript để kiểm tra sau khi làm. ' +
    'Câu điền/short answer chấm theo answer key, không trừ điểm câu bỏ trống. ' +
    'Mã đề: IELTS-L-2026-01 · Cấp độ: Trung cấp - Khó.',
  durationSeconds: 1800,
  isPremium: false,
  sections: [IELTS_LISTENING_SECTION],
  expectTotalQuestions: 40,
  expectSectionQuestions: { Listening: 40 },
};

export const IELTS_READING_EXAM: SeedExam = {
  title: 'IELTS Reading - Test 1 (3 passage, 40 câu)',
  typeName: 'IELTS',
  formatName: 'IELTS Reading Format 2026',
  description:
    'Bài thi IELTS Reading một mình: 60 phút, 3 passage (13 + 13 + 14 = 40 câu) — ' +
    'TFNG, matching headings/information/features, completion, YNNG, diagram, short answer. ' +
    'Bài đọc và câu hỏi cuộn độc lập trên cột trái/phải như thi thật. ' +
    'Câu trắc nghiệm chấm tự động; câu điền/short answer chấm theo answer key. ' +
    'Mã đề: IELTS-R-2026-01 · Cấp độ: Trung cấp - Khó.',
  durationSeconds: 3600,
  isPremium: false,
  sections: [IELTS_READING_SECTION],
  expectTotalQuestions: 40,
  expectSectionQuestions: { Reading: 40 },
};

export const IELTS_WRITING_EXAM: SeedExam = {
  title: 'IELTS Writing - Test 1 (Task 1 + Task 2)',
  typeName: 'IELTS',
  formatName: 'IELTS Writing Format 2026',
  description:
    'Bài thi IELTS Writing một mình: 60 phút — Task 1 mô tả biểu đồ (ít nhất 150 từ, 20 phút) ' +
    '+ Task 2 opinion essay (ít nhất 250 từ, 40 phút). Ô soạn thảo kèm đếm từ trực tiếp, ' +
    'bài làm lưu lên máy chủ (answerText) và chấm theo rubric Task Achievement / Coherence. ' +
    'Mã đề: IELTS-W-2026-01 · Cấp độ: Trung cấp - Khó.',
  durationSeconds: 3600,
  isPremium: false,
  sections: [IELTS_WRITING_SECTION],
  expectTotalQuestions: 2,
  expectSectionQuestions: { Writing: 2 },
};

export const IELTS_SPEAKING_EXAM: SeedExam = {
  title: 'IELTS Speaking - Test 1 (3 phần, 17 câu)',
  typeName: 'IELTS',
  formatName: 'IELTS Speaking Format 2026',
  description:
    'Bài thi IELTS Speaking một mình: khoảng 15 phút — Part 1 (10 câu cá nhân), ' +
    'Part 2 cue card (1 phút chuẩn bị + 1-2 phút nói), Part 3 (6 câu thảo luận sâu). ' +
    'Bấm "Bấm ghi âm" để trả lời từng câu, audio mô phỏng lưu làm answerText để chấm theo rubric. ' +
    'Mã đề: IELTS-S-2026-01 · Cấp độ: Trung cấp - Khó.',
  durationSeconds: 900,
  isPremium: false,
  sections: [IELTS_SPEAKING_SECTION],
  expectTotalQuestions: 17,
  expectSectionQuestions: { Speaking: 17 },
};
