/**
 * seed-content/index.ts — registry of every exam the seed installs.
 *
 * `seed-exams.ts` validates this list BEFORE wiping anything, then inserts
 * exactly these exams (nothing else) inside one transaction per exam.
 *
 * Thứ tự = id sau khi seed (TRUNCATE … RESTART IDENTITY):
 *   1 TOEIC L&R · 2 TOEIC Speaking · 3 TOEIC Writing ·
 *   4-7 IELTS Listening / Reading / Writing / Speaking ·
 *   8 GENERAL Tổng hợp (giao diện đề chung).
 *
 * GHI CHÚ: đề IELTS Full 4 kỹ năng (IELTS_ACADEMIC_EXAM) đã GỠ — mỗi đề
 * IELTS giờ là 1 kỹ năng riêng; người dùng tự chọn phần muốn làm
 * (Section/Passage/Task/Part) ngay trang hướng dẫn.
 */
import {
  IELTS_LISTENING_EXAM,
  IELTS_READING_EXAM,
  IELTS_SPEAKING_EXAM,
  IELTS_WRITING_EXAM,
} from './ielts/skill-exams';
import { GENERAL_EXAM } from './general/exam';
import { TOEIC_LR_EXAM } from './toeic/exam';
import { TOEIC_SPEAKING_EXAM } from './toeic/speaking';
import { TOEIC_WRITING_EXAM } from './toeic/writing';
import type { SeedExam } from './types';

export const SEED_EXAMS: readonly SeedExam[] = [
  TOEIC_LR_EXAM,
  TOEIC_SPEAKING_EXAM,
  TOEIC_WRITING_EXAM,
  IELTS_LISTENING_EXAM,
  IELTS_READING_EXAM,
  IELTS_WRITING_EXAM,
  IELTS_SPEAKING_EXAM,
  GENERAL_EXAM,
];
