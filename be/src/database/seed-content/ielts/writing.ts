/**
 * seed-content/ielts/writing.ts — IELTS Academic Writing (2 tasks).
 *
 * Both tasks are ESSAY questions (recorded as `answerText`, never auto-graded);
 * Task 1 carries the chart image placeholder, Task 2 the prompt as TEXT.
 */
import { SeedGroup, note, openTask } from '../types';

export const IELTS_WRITING: SeedGroup[] = [
  {
    title: 'Writing Task 1 - Chart report (150+ words, 20 minutes)',
    groupType: 'IMAGE',
    instructions:
      'Viết một đoạn mô tả biểu đồ ít nhất 150 từ trong ~20 phút. Không nêu ý kiến cá nhân; dùng ngôn ngữ mô tả xu hướng và so sánh.',
    materials: [
      {
        type: 'IMAGE',
        title: 'Biểu đồ: Tỷ lệ điện sản xuất từ 5 nguồn, 2010-2024',
        fileUrl: '/images/ielts/writing-task1-chart.jpg',
      },
      {
        type: 'TEXT',
        title: 'Yêu cầu Task 1',
        content:
          'The chart below shows the percentage of electricity generated from five sources (coal, natural gas, nuclear, wind and solar) in a European country between 2010 and 2024.\n\n' +
          'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\n' +
          'Write at least 150 words. You should spend about 20 minutes on this task.',
      },
    ],
    questions: [
      openTask(
        'ESSAY',
        'The chart below shows the percentage of electricity generated from five sources in a European country between 2010 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
        note(
          'Bài mẫu Task 1 (chart): mở đầu paraphrase đề (The chart illustrates…), 2 thân bài nhóm theo xu hướng (than và khí đốt giảm; gió và mặt trời tăng; hạt nhân ổn định), kết bằng overview KHÔNG số liệu. Phải có: >=150 từ, ít nhất 1 trend + 1 so sánh, không ý kiến cá nhân.',
          'a sharp decline (n) - sự sụt giảm mạnh',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Writing Task 2 - Opinion essay (250+ words, 40 minutes)',
    groupType: 'CUSTOM',
    instructions:
      'Viết bài luận quan điểm ít nhất 250 từ trong ~40 phút. Nêu rõ quan điểm ở introduction, lập luận có ví dụ ở thân bài, kết luận chốt lại.',
    materials: [
      {
        type: 'TEXT',
        title: 'Yêu cầu Task 2',
        content:
          'Some people believe that governments should spend money on free university education rather than on student loan programs.\n\n' +
          'To what extent do you agree or disagree?\n\n' +
          'Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
      },
    ],
    questions: [
      openTask(
        'ESSAY',
        'Some people believe that governments should spend money on free university education rather than on student loan programs. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples. Write at least 250 words.',
        note(
          'Bài mẫu Task 2 (opinion): 4 đoạn - introduction paraphrase + thesis rõ (partly agree), body 1 argument chính (giảm rào cản tiếp cận, tăng năng lực lao động) + ví dụ, body 2 counter-argument (ngân sách hạn chế -> hoàn thiện chương trình vay) + phản biện, conclusion chốt. >=250 từ, tránh liệt kê, điểm cao nhờ cohesion và vocabulary range.',
          'to what extent - đến mức nào',
          'Khó',
        ),
      ),
    ],
  },
];
