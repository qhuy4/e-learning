/**
 * seed-content/toeic/speaking.ts — đề TOEIC Speaking (11 task).
 *
 * Mỗi task = 1 group:
 *   - group.title       = "Speaking Task N - <English group label>" (FE map label → kind)
 *   - group.instructions = prompt tiếng Anh ("… N seconds to prepare, then M seconds to …")
 *                          → FE parse prepSec/responseSec từ đây
 *   - materials[0]      = TEXT { content: nội dung task }
 *       · info-response: các dòng thông tin, cách "--", rồi câu yêu cầu
 *         → FE tách thành info[] + text
 *       · còn lại: chỉ text (đọc/thắc hỏi/chủ đề)
 *   - materials[1]      = (describe-picture) IMAGE placeholder → FE hiện imageHint
 *   - questions[0]      = AUDIO_RECORD (không đáp án — lưu answerText)
 *
 * Nội dung mirror `fe/.../toeic/mocks/speaking-mock.ts#SPEAKING_TASKS`.
 */
import { SeedGroup, SeedExam, openTask } from '../types';

interface SpeakingTaskDef {
  id: number;
  /** English label nhóm — FE map sang kind (read-aloud / describe-picture / …). */
  title: string;
  /** Prompt hướng dẫn (chứa số giây prepare/response). */
  prompt: string;
  /** TEXT chính: nội dung cần đọc / câu hỏi / chủ đề (info-response: có "--" phân tách). */
  content: string;
  /** Mô tả tranh (describe-picture) — FE hiện như imageHint. */
  imageHint?: string;
  stem: string;
  explanation: string;
}

const TASKS: SpeakingTaskDef[] = [
  {
    id: 1,
    title: 'Read a Text Aloud',
    prompt: 'Look at the text on your screen. You will have 45 seconds to prepare, then 45 seconds to read it aloud.',
    content:
      'Attention, all staff: the quarterly planning meeting has been moved to Conference Room B on Thursday at 10 a.m. Please bring your department reports and arrive five minutes early. Contact the front desk if you have any questions.',
    stem: 'Task 1 — Đọc to thông báo đổi địa điểm họp quý trên màn hình.',
    explanation:
      'Đọc đúng nhịp: ngắt câu tại dấu (), nhấn thông tin chính (Conference Room B, Thursday, 10 a.m.), phát âm rõ phụ âm cuối. · Từ vựng: quarterly (adj) — hàng quý · Trình độ: Dễ',
  },
  {
    id: 2,
    title: 'Read a Text Aloud',
    prompt: 'Look at the memo on your screen. You will have 45 seconds to prepare, then 45 seconds to read it aloud.',
    content:
      'Memorandum: Effective next Monday, the west parking lot will be closed for resurfacing. Employees who normally park there should use the visitor lot near the main entrance. The work is expected to take three days.',
    stem: 'Task 2 — Đọc to ghi chú về việc đóng cửa bãi đỗ phía tây.',
    explanation:
      'Giọng đều, trôi chảy; nối từ tự nhiên (will be closed, expected to); giữ đúng trọng âm từ khóa (resurfacing, visitor). · Từ vựng: resurfacing (n) — trải lại mặt đường · Trình độ: Dễ',
  },
  {
    id: 3,
    title: 'Describe a Picture',
    prompt: 'Look at the picture. Describe the picture and talk about what is happening. You will have 30 seconds to prepare, then 45 seconds to respond.',
    content:
      'Describe the scene: who is in the picture, what they are doing, and where it is taking place.',
    imageHint: 'Picture: four colleagues sitting around a table in a meeting room, one presenting a chart on a screen',
    stem: 'Task 3 — Mô tả bức tranh cuộc họp với 4 đồng nghiệp và biểu đồ trên màn hình.',
    explanation:
      'Mô tả theo 3 lớp: người (four colleagues) → hành động (presenting a chart) → địa điểm (meeting room). Dùng hiện tại tiếp diễn (are sitting). · Từ vựng: colleague (n) — đồng nghiệp · Trình độ: Trung cấp',
  },
  {
    id: 4,
    title: 'Describe a Picture',
    prompt: 'Look at the picture. Describe the picture and talk about what is happening. You will have 30 seconds to prepare, then 45 seconds to respond.',
    content: 'Describe the setting, the people, and what is likely happening in the picture.',
    imageHint: 'Picture: a customer speaking with a receptionist at a hotel front desk, luggage trolley nearby',
    stem: 'Task 4 — Mô tả bức tranh khách hàng tại quầy lễ tân khách sạn.',
    explanation:
      'Gồm bối cảnh (hotel front desk), nhân vật (customer, receptionist), diễn biến dự đoán (checking in). Suy đoán bằng "probably/likely". · Từ vựng: receptionist (n) — lễ tân · Trình độ: Trung cấp',
  },
  {
    id: 5,
    title: 'Respond to Questions',
    prompt: 'You will have 10 seconds to prepare, then 30 seconds to answer the question.',
    content: 'What do you usually do during your lunch break at work?',
    stem: 'Task 5 — Trả lời câu hỏi về thói quen giờ nghỉ trưa tại công sở.',
    explanation:
      'Trả lời trực tiếp + 1-2 chi tiết (I usually grab a quick lunch with colleagues…). Tránh trả lời một chữ; giữ 30 giây đều giọng. · Từ vựng: lunch break (n) — giờ nghỉ trưa · Trình độ: Dễ',
  },
  {
    id: 6,
    title: 'Respond to Questions',
    prompt: 'You will have 10 seconds to prepare, then 30 seconds to answer the question.',
    content: 'What kinds of projects do you enjoy working on the most? Why?',
    stem: 'Task 6 — Trả lời câu hỏi về loại dự án yêu thích và lý do.',
    explanation:
      'Cấu trúc: chọn loại dự án → lý do (skills, impact) → ví dụ ngắn. Dùng từ nối vì (because, since). · Từ vựng: enjoy doing sth (v) — thích làm gì · Trình độ: Trung cấp',
  },
  {
    id: 7,
    title: 'Respond to Questions',
    prompt: 'You will have 10 seconds to prepare, then 30 seconds to answer the question.',
    content: 'How do you usually get to work, and would you like to change the way you travel?',
    stem: 'Task 7 — Trả lời câu hỏi về phương tiện đi làm và có muốn đổi không.',
    explanation:
      'Trả lời 2 vế: hiện tại (I take the bus…) + mong muốn (I’d rather ride a bike because…). Nêu lý do ngắn. · Từ vựng: commute (v/n) — đi lại làm việc · Trình độ: Trung cấp',
  },
  {
    id: 8,
    title: 'Respond Using Information',
    prompt: 'Read the information below. You will have 30 seconds to prepare, then 60 seconds to respond to the question using the information.',
    content:
      'Meeting room: R-204\nAvailable: 2:00 p.m. – 4:00 p.m.\nProjector: yes\nSeats: 12\n--\n' +
      'A coworker asks you to book a room for a four-person team meeting in the afternoon. Respond to the caller.',
    stem: 'Task 8 — Trả lời cuộc gọi đặt phòng họp buổi chiều theo thông tin R-204.',
    explanation:
      'Phải dùng hết thông tin cho: tên phòng, khung giờ, máy chiếu, số ghế. Mở đầu lịch sự, kết thúc xác nhận. · Từ vựng: book a room (v) — đặt phòng · Trình độ: Trung cấp',
  },
  {
    id: 9,
    title: 'Respond Using Information',
    prompt: 'Read the information below. You will have 30 seconds to prepare, then 60 seconds to respond to the question using the information.',
    content:
      'Project deadline: Friday, Nov 14\nCurrent status: 70% complete\nDelay risk: shipping approval\nTeam: 3 members\n--\n' +
      'Your manager asks about the status of the report. Give an update using the notes.',
    stem: 'Task 9 — Cập nhật tiến độ báo cáo cho quản lý theo ghi chú dự án.',
    explanation:
      'Cập nhật đủ: % hoàn thành, rủi ro (shipping approval), thời hạn 14/11, nhân sự 3 người. Giọng chủ động, nêu bước tiếp theo. · Từ vựng: status (n) — tình trạng · Trình độ: Trung cấp',
  },
  {
    id: 10,
    title: 'Respond Using Information',
    prompt: 'Read the information below. You will have 30 seconds to prepare, then 60 seconds to respond to the question using the information.',
    content:
      'Order #48-2210\nPlaced: Monday\nStatus: delayed in transit\nNew arrival: Wednesday\nRefund: available on request\n--\n' +
      'A customer calls about a late order. Explain the situation and offer a solution.',
    stem: 'Task 10 — Giải thích đơn hàng giao trễ #48-2210 và đề nghị phương án cho khách.',
    explanation:
      'Đúng kịch bản dịch vụ: xác nhận mã đơn, giải thích (delayed in transit), thời gian mới (Wednesday), phương án hoàn tiền nếu khách muốn. Xin lỗi chân thành. · Từ vựng: in transit (phrase) — đang vận chuyển · Trình độ: Khó',
  },
  {
    id: 11,
    title: 'Express an Opinion',
    prompt: 'You will have 30 seconds to prepare, then 60 seconds to give your opinion on the topic below.',
    content:
      'Some companies allow employees to work from home three days a week. Do you think this is a good idea? Explain your reasons.',
    stem: 'Task 11 — Nêu quan điểm về việc cho phép làm việc tại nhà 3 ngày/tuần.',
    explanation:
      'Quan điểm rõ ngay câu đầu (I believe it is a good idea) + 2 lý do có ví dụ (flexibility, productivity) + cân nhắc nhỏ (teamwork). Kết luận nhấn lại. · Từ vựng: work from home (phrase) — làm việc tại nhà · Trình độ: Khó',
  },
];

function buildGroups(): SeedGroup[] {
  return TASKS.map((task) => {
    const materials: NonNullable<SeedGroup['materials']> = [
      { type: 'TEXT', title: task.title, content: task.content },
    ];
    if (task.imageHint) {
      materials.push({
        type: 'IMAGE',
        title: task.imageHint,
        fileUrl: `/images/toeic/speaking-task-${task.id}.jpg`,
      });
    }
    return {
      title: `Speaking Task ${task.id} - ${task.title}`,
      groupType: task.imageHint ? ('IMAGE' as const) : ('CUSTOM' as const),
      instructions: task.prompt,
      materials,
      questions: [openTask('AUDIO_RECORD', task.stem, task.explanation)],
    };
  });
}

export const TOEIC_SPEAKING_EXAM: SeedExam = {
  title: 'TOEIC Speaking - Test 1 (11 task)',
  typeName: 'TOEIC',
  formatName: 'TOEIC Speaking Format 2026',
  description:
    'Bài thi TOEIC Speaking 11 task theo format ETS (khoảng 20 phút): Read a Text Aloud (2), ' +
    'Describe a Picture (2), Respond to Questions (3), Respond Using Information (3), Express an Opinion (1). ' +
    'Mỗi task có thời gian chuẩn bị và trả lời riêng, ghi âm mô phỏng trên giao diện CBT; bài ghi âm được lưu ' +
    'lên máy chủ (answerText) để chấm theo rubric. Mã đề: TOEIC-SP-2026-01.',
  durationSeconds: 1200,
  isPremium: false,
  sections: [
    {
      name: 'Speaking',
      formatSection: 'Speaking',
      description: '11 task nói — đọc to, mô tả tranh, trả lời câu hỏi/thông tin, nêu quan điểm.',
      instructions:
        'Nghe/prompt hiện trên màn hình, chuẩn bị trong thời gian quy định rồi bấm "Bấm ghi âm" và trả lời.',
      durationSeconds: 1200,
      groups: buildGroups(),
    },
  ],
  expectTotalQuestions: 11,
  expectSectionQuestions: { Speaking: 11 },
};
