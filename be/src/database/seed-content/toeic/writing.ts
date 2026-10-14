/**
 * seed-content/toeic/writing.ts — đề TOEIC Writing (8 task).
 *
 * Mỗi task = 1 group:
 *   - group.title   = "Writing Task N - <English title>" (FE strip tiền tố → title)
 *   - materials[0]  = TEXT { title: nhãn tiếng Việt (type), content: prompt }
 *                     email tasks bắt đầu bằng "From: … / Subject: …" → FE dựng email card
 *   - materials[1]  = (task có tranh) IMAGE placeholder → FE bật khu vực mô tả tranh
 *   - group.instructions = "Yêu cầu: viết ít nhất N từ. Từ khóa: a, b, c."
 *                     → FE parse minWords + keywords
 *   - questions[0]  = ESSAY (không đáp án — lưu answerText, chấm theo rubric)
 *
 * Nội dung mirror `fe/.../toeic/mocks/exam-mock.ts#TOEIC_WRITING_TASKS` để
 * giao diện chế độ API hiển thị đúng như mock (cùng title/type/prompt).
 */
import { SeedGroup, SeedExam, openTask } from '../types';

interface WritingTaskDef {
  id: number;
  /** Nhãn tiếng Việt — material TEXT title. */
  type: string;
  /** English title — group.title sau tiền tố. */
  title: string;
  /** Prompt (email tasks có header From/Subject ở đầu). */
  content: string;
  minWords: number;
  keywords: string[];
  /** Stem tiếng Việt của câu ESSAY — duy nhất trong đề. */
  stem: string;
  /** Giải thích tiếng Việt: gợi ý cách làm bài + rubric. */
  explanation: string;
  /** Task 1 có tranh minh họa (placeholder → FE hiện ô ảnh trung thực). */
  hasImage?: boolean;
}

const TASKS: WritingTaskDef[] = [
  {
    id: 1,
    type: 'Viết câu từ tranh',
    title: 'Write a Sentence from a Picture',
    content:
      'Look at the picture and write ONE sentence that describes it accurately. Use complete grammar.',
    minWords: 10,
    keywords: ['meeting', 'discuss', 'schedule', 'presentation'],
    stem: 'Task 1 — Viết một câu (ít nhất 10 từ) mô tả chính xác bức tranh được cho.',
    explanation:
      'Một câu đủ chủ ngữ – vị ngữ – tân ngữ, thì hiện tại đơn phù hợp hành động trong tranh. Ví dụ: "The colleagues are discussing the schedule around the table." · Từ vựng: discuss (v) — thảo luận · Trình độ: Dễ',
    hasImage: true,
  },
  {
    id: 2,
    type: 'Phản hồi email',
    title: 'Respond to an E-mail',
    content:
      'From: Daniel Park <d.park@horizonhotels.com>\n' +
      'Subject: Question about your recent order\n\n' +
      'You are Naomi Chen. Write an e-mail responding to Mr. Park\'s request. ' +
      'Include a greeting, your answer, and a closing.',
    minWords: 30,
    keywords: [],
    stem: 'Task 2 — Viết email phản hồi yêu cầu của Mr. Park (greeting, câu trả lời, closing).',
    explanation:
      'Email đủ 3 phần: lời chào (Dear Mr. Park,), nội dung trả lời đúng câu hỏi của người gửi, và lời kết (Best regards,). Giọng điệu lịch sự, đúng văn phong công sở. · Từ vựng: recent order (n) — đơn hàng gần đây · Trình độ: Trung cấp',
  },
  {
    id: 3,
    type: 'Bài luận quan điểm',
    title: 'Opinion Essay',
    content:
      'Do you agree that companies should allow employees to work from home three days a week? ' +
      'Explain your reasons with specific examples.',
    minWords: 80,
    keywords: ['productivity', 'commute', 'teamwork', 'flexibility'],
    stem: 'Task 3 — Bài luận nêu quan điểm về việc cho phép làm việc tại nhà 3 ngày/tuần (ít nhất 80 từ).',
    explanation:
      'Cấu trúc 4 phần: mở đầu nêu quan điểm, 2 đoạn lý do kèm ví dụ cụ thể, kết luận nhắc lại quan điểm. Chấm theo rubric: rõ ràng, có ví dụ, từ vựng học thuật (productivity, flexibility). · Từ vựng: allow sb to do sth (v) — cho phép ai làm gì · Trình độ: Trung cấp',
  },
  {
    id: 4,
    type: 'Phản hồi email công việc',
    title: 'Respond to a Workplace E-mail',
    content:
      'From: Laura Bennett <l.bennett@brightstar.co>\n' +
      'Subject: Revised timeline for the Q4 launch\n\n' +
      'Reply to your colleague about the revised project timeline. ' +
      'Confirm the new deadlines and mention one possible risk.',
    minWords: 40,
    keywords: ['deadline', 'milestone', 'risk'],
    stem: 'Task 4 — Viết email xác nhận deadline mới và nêu 1 rủi ro của dự án Q4.',
    explanation:
      'Trả lời đúng 2 yêu cầu: xác nhận mốc thời gian mới (concrete dates) và nêu ít nhất 1 rủi ro (risk) kèm giải pháp nhẹ. Văn phong đồng nghiệp, thân thiện nhưng chuyên nghiệp. · Từ vựng: revised (adj) — được sửa đổi · Trình độ: Trung cấp',
  },
  {
    id: 5,
    type: 'Viết ghi chú công sở',
    title: 'Write a Workplace Note',
    content:
      'Write a short note to your team about the office closure on Friday. ' +
      'Include the reason, duration, and what they should prepare.',
    minWords: 25,
    keywords: ['closure', 'prepare', 'deadline'],
    stem: 'Task 5 — Viết ghi chú thông báo văn phòng đóng cửa thứ Sáu (lý do, thời gian, việc cần chuẩn bị).',
    explanation:
      'Ghi chú ngắn gọn đủ 3 thông tin bắt buộc: lý do đóng cửa, thời gian (bao lâu), việc nhân viên cần chuẩn bị trước. Giọng điệu trực tiếp, súc tích. · Từ vựng: closure (n) — việc đóng cửa · Trình độ: Dễ',
  },
  {
    id: 6,
    type: 'Phản hồi email khiếu nại',
    title: 'Respond to a Complaint',
    content:
      'From: Robert Hale <r.hale@examplemail.com>\n' +
      'Subject: My order has not arrived\n\n' +
      'A customer complains about a delayed delivery. ' +
      'Write a polite e-mail apologizing and offering a solution.',
    minWords: 40,
    keywords: ['apologize', 'compensation', 'delivery'],
    stem: 'Task 6 — Viết email xin lỗi khách hàng về đơn hàng giao chậm và đề xuất giải pháp.',
    explanation:
      'Email khiếu nại cần: xin lỗi chân thành (We sincerely apologize), nguyên nhân ngắn gọn, giải pháp cụ thể (giao lại hoàn tiền/ưu đãi), lời hứa khắc phục. Không đổ lỗi cho khách. · Từ vựng: delayed delivery (n) — giao hàng chậm · Trình độ: Trung cấp',
  },
  {
    id: 7,
    type: 'Bài luận so sánh',
    title: 'Comparison Essay',
    content:
      'Compare working in a large company versus a small company. ' +
      'Which do you think is better for career growth? Why?',
    minWords: 80,
    keywords: ['salary', 'advancement', 'resources', 'culture'],
    stem: 'Task 7 — Bài luận so sánh làm ở công ty lớn và nhỏ, bên nào tốt cho sự phát triển nghề nghiệp (ít nhất 80 từ).',
    explanation:
      'Bài so sánh cân bằng: mỗi ý luôn có 2 vế (large vs small) rồi kết luận chọn bên với lý do riêng. Dùng từ nối (however, on the other hand, in contrast). · Từ vựng: career growth (n) — phát triển nghề nghiệp · Trình độ: Khó',
  },
  {
    id: 8,
    type: 'Phản hồi email đặt lịch',
    title: 'Respond to a Scheduling Request',
    content:
      'From: Ingrid Sørensen <i.sorensen@nordictech.dk>\n' +
      'Subject: Moving the training session\n\n' +
      'A client wants to move next week\'s training session. ' +
      'Reply with two alternative times and confirm the room booking.',
    minWords: 30,
    keywords: ['availability', 'reschedule', 'confirm'],
    stem: 'Task 8 — Viết email đổi lịch đào tạo: đề xuất 2 khung giờ thay thế và xác nhận phòng.',
    explanation:
      'Đúng cấu trúc yêu cầu: cảm ơn/ghi nhận yêu cầu, liệt kê rõ 2 phương án giờ (đầy đủ ngày + giờ), xác nhận phòng đã book. Nêu cách khách chọn (reply to confirm). · Từ vựng: reschedule (v) — dời lịch · Trình độ: Trung cấp',
  },
];

function buildGroups(): SeedGroup[] {
  return TASKS.map((task) => {
    const instructionParts = [`Yêu cầu: viết ít nhất ${task.minWords} từ.`];
    if (task.keywords.length > 0) instructionParts.push(`Từ khóa: ${task.keywords.join(', ')}.`);

    return {
      title: `Writing Task ${task.id} - ${task.title}`,
      groupType: 'CUSTOM' as const,
      instructions: instructionParts.join(' '),
      materials: [
        {
          type: 'TEXT' as const,
          title: task.type,
          content: task.content,
        },
        ...(task.hasImage
          ? [
              {
                type: 'IMAGE' as const,
                title: `Ảnh minh họa Task ${task.id}`,
                fileUrl: `/images/toeic/writing-task-${task.id}.jpg`,
              },
            ]
          : []),
      ],
      questions: [openTask('ESSAY', task.stem, task.explanation)],
    };
  });
}

export const TOEIC_WRITING_EXAM: SeedExam = {
  title: 'TOEIC Writing - Test 1 (8 task)',
  typeName: 'TOEIC',
  formatName: 'TOEIC Writing Format 2026',
  description:
    'Bài thi TOEIC Writing 8 task theo format 2026 (60 phút): Viết câu từ tranh, phản hồi email, ' +
    'bài luận quan điểm/so sánh, ghi chú công sở. Mỗi task có ô soạn thảo kèm đếm từ và gợi ý từ khóa; ' +
    'bài làm được lưu lên máy chủ (answerText) và chấm theo rubric. Mã đề: TOEIC-WR-2026-01.',
  durationSeconds: 3600,
  isPremium: false,
  sections: [
    {
      name: 'Writing',
      formatSection: 'Writing',
      description: '8 task viết — mô tả tranh, phản hồi email, bài luận; trả lời vào ô văn bản có đếm từ.',
      instructions:
        'Đọc kỹ yêu cầu từng task. Task email cần đủ greeting – body – closing; bài luận cần mở đầu, thân bài có ví dụ, kết luận.',
      durationSeconds: 3600,
      groups: buildGroups(),
    },
  ],
  expectTotalQuestions: 8,
  expectSectionQuestions: { Writing: 8 },
};
