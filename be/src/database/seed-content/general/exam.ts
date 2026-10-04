/**
 * seed-content/general/exam.ts — đề Tổng hợp Kiến thức Chung (type GENERAL).
 *
 * Đề mẫu cho GIAO DIỆN ĐỀ CHUNG (`/exams/:id/take`) — không thuộc TOEIC/IELTS:
 *   - Section "Nghe hiểu": 2 nhóm audio (file TTS trong
 *     `fe/apps/client/public/audio/general/`) + transcript, 5 câu MC mỗi nhóm.
 *   - Section "Đọc hiểu": 4 câu trực tiếp (3 MC + 1 FILL_BLANK có đáp án) +
 *     1 nhóm đoạn thông báo (5 MC + 1 ESSAY tự luận không chấm tự động).
 *
 * Tổng 20 câu, 1800 giây — section names phải khớp chính xác định nghĩa
 * format "Đề tổng hợp Format 2026" trong seed-exams.ts.
 */
import type { SeedExam } from '../types';

const LIBRARY_TRANSCRIPT =
  'Good afternoon, everyone. Please note that the main library will close at six p.m. ' +
  'this Friday for scheduled maintenance. During the closure, all study rooms and computer ' +
  'labs will be unavailable. If you need to return books, please use the drop box at the ' +
  'east entrance. The library will reopen at eight a.m. on Monday. We apologize for any ' +
  'inconvenience and thank you for your understanding.';

const MEETING_TRANSCRIPT =
  'Hi Sarah, this is Tom. I am calling about our meeting with the marketing team. ' +
  "It has been moved from ten o'clock to two o'clock this afternoon, in conference room B. " +
  'The client has sent over their feedback, so please bring the latest design documents and ' +
  'the budget report. If you cannot make it, call me back before noon. Thanks a lot. Bye.';

export const GENERAL_EXAM: SeedExam = {
  title: 'Đề Tổng hợp Kiến thức Chung — Nghe & Đọc (Demo)',
  typeName: 'GENERAL',
  formatName: 'Đề tổng hợp Format 2026',
  description:
    'Đề tổng hợp kiểm tra kiến thức chung, 20 câu (30 phút): Nghe hiểu - 2 đoạn ghi âm ' +
    'thông báo/hội thoại tiếng Anh; Đọc hiểu - câu hỏi kiến thức và đoạn thông báo tiếng Việt. ' +
    'Làm bài trên giao diện đề chung, chấm tự động câu trắc nghiệm và điền khuyết.',
  durationSeconds: 1800,
  isPremium: false,
  sections: [
    {
      name: 'Nghe hiểu',
      formatSection: 'Nghe hiểu',
      description: '2 đoạn ghi âm ngắn (thông báo thư viện, đổi lịch họp) - 10 câu trắc nghiệm.',
      instructions:
        'Nghe mỗi đoạn ghi âm một lần và chọn phương án đúng nhất. Có thể bấm "Xem transcript" nếu muốn xem nội dung.',
      durationSeconds: 600,
      groups: [
        {
          title: 'Nghe 1 — Thông báo về thư viện',
          groupType: 'AUDIO',
          instructions:
            'Nghe đoạn thông báo sau và chọn 5 câu trả lời đúng. Bạn có thể mở "Xem transcript" để xem nội dung ghi âm.',
          materials: [
            {
              type: 'AUDIO',
              title: 'Thông báo đóng cửa thư viện để bảo trì',
              fileUrl: '/audio/general/listening-01.wav',
              transcript: LIBRARY_TRANSCRIPT,
            },
          ],
          questions: [
            {
              q: 'Why will the main library close this Friday?',
              options: [
                'For scheduled maintenance',
                'For a national holiday',
                'For a staff training day',
                'Because of a new construction project',
              ],
              answer: 0,
              explanation:
                'Đoạn ghi âm nói "close at six p.m. this Friday for scheduled maintenance" — thư viện đóng để bảo trì theo lịch.',
            },
            {
              q: 'What will be unavailable during the closure?',
              options: [
                'The book return desk',
                'Study rooms and computer labs',
                'The east entrance',
                'The online catalogue',
              ],
              answer: 1,
              explanation:
                'Câu "all study rooms and computer labs will be unavailable" — cả phòng học và phòng máy đều ngừng hoạt động.',
            },
            {
              q: 'How should students return books during the closure?',
              options: [
                'By post to the main desk',
                'At the east entrance drop box',
                'On Monday morning only',
                'Through the online catalogue',
              ],
              answer: 1,
              explanation:
                'Ghi âm hướng dẫn "use the drop box at the east entrance" — thùng trả sách ở lối vào phía Đông.',
            },
            {
              q: 'When will the library reopen?',
              options: ['At six p.m. on Friday', 'At eight a.m. on Saturday', 'At eight a.m. on Monday', 'Next Tuesday'],
              answer: 2,
              explanation: 'Câu cuối: "The library will reopen at eight a.m. on Monday." — mở lại 8 giờ sáng thứ Hai.',
            },
            {
              q: 'What is the main purpose of the announcement?',
              options: [
                'To introduce a new library service',
                'To warn students about overdue books',
                'To inform users about a temporary closure',
                'To invite students to a maintenance tour',
              ],
              answer: 2,
              explanation:
                'Toàn đoạn là thông báo đóng tạm thời để bảo trì + cách trả sách, nên mục đích là inform about a temporary closure.',
            },
          ],
        },
        {
          title: 'Nghe 2 — Cuộc gọi đổi lịch họp',
          groupType: 'AUDIO',
          instructions:
            'Nghe đoạn hội thoại sau và chọn 5 câu trả lời đúng. Bạn có thể mở "Xem transcript" để xem nội dung ghi âm.',
          materials: [
            {
              type: 'AUDIO',
              title: 'Cuộc gọi đổi lịch họp với nhóm Marketing',
              fileUrl: '/audio/general/listening-02.wav',
              transcript: MEETING_TRANSCRIPT,
            },
          ],
          questions: [
            {
              q: 'What is the main purpose of the message?',
              options: [
                'To cancel the meeting',
                'To inform Sarah about a schedule change',
                'To introduce the marketing team',
                'To ask Sarah to prepare a budget',
              ],
              answer: 1,
              explanation: 'Tom gọi để báo cuộc họp đổi giờ — "It has been moved from ten o\'clock to two o\'clock".',
            },
            {
              q: 'When will the meeting take place?',
              options: ['At ten o\'clock in the morning', 'At noon', 'At two o\'clock this afternoon', 'Tomorrow morning'],
              answer: 2,
              explanation: 'Ghi âm nói rõ "moved from ten o\'clock to two o\'clock this afternoon".',
            },
            {
              q: 'Where will the meeting be held?',
              options: ['Conference room B', 'The client\'s office', 'The marketing office', 'Room A101'],
              answer: 0,
              explanation: 'Chi tiết "in conference room B" — địa điểm giữ nguyên, chỉ đổi giờ.',
            },
            {
              q: 'What does Tom ask Sarah to bring?',
              options: [
                'The meeting minutes',
                'The latest design documents and the budget report',
                'A copy of the client contract',
                'The new marketing brochure',
              ],
              answer: 1,
              explanation: 'Yêu cầu "bring the latest design documents and the budget report" — hai tài liệu này.',
            },
            {
              q: 'What should Sarah do if she cannot attend?',
              options: [
                'Send an email to the client',
                'Call Tom back before noon',
                'Arrive at two o\'clock anyway',
                'Ask a colleague to represent her',
              ],
              answer: 1,
              explanation: 'Lời cuối: "If you cannot make it, call me back before noon." — gọi lại Tom trước buổi trưa.',
            },
          ],
        },
      ],
    },
    {
      name: 'Đọc hiểu',
      formatSection: 'Đọc hiểu',
      description: '4 câu kiến thức chung (có 1 câu điền khuyết) + 1 đoạn thông báo, 6 câu hỏi.',
      durationSeconds: 1200,
      questions: [
        {
          q: 'Đỉnh núi cao nhất Việt Nam là đỉnh nào?',
          options: ['Fansipan', 'Bạch Mã', 'Tam Đảo', 'Chư Yang Sin'],
          answer: 0,
          explanation: 'Fansipan (3.143 m) ở dãy Hoàng Liên Sơn là đỉnh cao nhất Việt Nam.',
        },
        {
          q: 'Hành tinh lớn nhất trong hệ Mặt Trời là hành tinh nào?',
          options: ['Mộc tinh', 'Thổ tinh', 'Trái Đất', 'Sao Hỏa'],
          answer: 0,
          explanation: 'Mộc tinh (Jupiter) là hành tinh lớn nhất, đường kính gấp khoảng 11 lần Trái Đất.',
        },
        {
          type: 'FILL_BLANK',
          q: 'Sông dài nhất thế giới là ______ (viết tên tiếng Anh).',
          answers: ['Nile', 'Nin', 'sông Nin'],
          explanation: 'Sông Nile (Ai Cập – Sudan) dài khoảng 6.650 km, là sông dài nhất thế giới.',
        },
        {
          q: 'Khoảng bao nhiêu phần trăm bề mặt Trái Đất được bao phủ bởi nước?',
          options: ['Khoảng 71%', 'Khoảng 50%', 'Khoảng 60%', 'Khoảng 80%'],
          answer: 0,
          explanation: 'Các đại dương bao phủ khoảng 71% bề mặt Trái Đất, phần còn lại là đất liền.',
        },
      ],
      groups: [
        {
          title: 'Đọc đoạn — Thông báo lớp học bổ sung',
          groupType: 'PASSAGE',
          instructions: 'Đọc đoạn thông báo dưới đây và trả lời các câu hỏi 5–10.',
          materials: [
            {
              type: 'PASSAGE',
              title: 'THÔNG BÁO VỀ CÁC LỚP HỌC BỔ SUNG',
              content:
                'Kính gửi các bạn sinh viên,\n\n' +
                'Nhằm hỗ trợ các bạn chuẩn bị kỳ thi giữa kỳ, nhà trường sẽ mở các lớp học bổ sung miễn phí từ tuần sau. ' +
                'Lớp Toán nâng cao diễn ra vào thứ Ba và thứ Năm, từ 18 giờ đến 20 giờ, tại phòng A302. ' +
                'Lớp Tiếng Anh giao tiếp diễn ra vào thứ Tư, từ 18 giờ 30 đến 20 giờ 30, tại phòng B105.\n\n' +
                'Sinh viên đăng ký qua biểu mẫu trực tuyến trước 17 giờ ngày thứ Sáu tuần này. ' +
                'Mỗi lớp giới hạn 40 chỗ, nên các bạn hãy đăng ký sớm để không bỏ lỡ cơ hội.\n\n' +
                'Trân trọng,\nPhòng Đào tạo',
            },
          ],
          questions: [
            {
              q: 'Lớp Toán nâng cao diễn ra vào những ngày nào?',
              options: ['Thứ Hai và thứ Tư', 'Thứ Ba và thứ Năm', 'Thứ Tư và thứ Sáu', 'Chỉ thứ Bảy'],
              answer: 1,
              explanation: 'Đoạn nêu rõ "lớp Toán nâng cao diễn ra vào thứ Ba và thứ Năm".',
            },
            {
              q: 'Lớp Toán nâng cao học tại phòng nào?',
              options: ['Phòng A302', 'Phòng B105', 'Phòng A101', 'Phòng C401'],
              answer: 0,
              explanation: '"…từ 18 giờ đến 20 giờ, tại phòng A302" — Toán ở A302, Tiếng Anh ở B105.',
            },
            {
              q: 'Lớp Tiếng Anh giao tiếp bắt đầu lúc mấy giờ?',
              options: ['18 giờ', '18 giờ 30', '19 giờ', '20 giờ 30'],
              answer: 1,
              explanation: 'Thông báo ghi "thứ Tư, từ 18 giờ 30 đến 20 giờ 30" — bắt đầu 18 giờ 30.',
            },
            {
              q: 'Hạn cuối để sinh viên đăng ký là khi nào?',
              options: [
                'Trước 17 giờ ngày thứ Sáu tuần này',
                'Trước 18 giờ ngày thứ Hai tuần sau',
                'Sau buổi học đầu tiên',
                'Không có hạn đăng ký',
              ],
              answer: 0,
              explanation: 'Câu "đăng ký qua biểu mẫu trực tuyến trước 17 giờ ngày thứ Sáu tuần này".',
            },
            {
              q: 'Vì sao sinh viên nên đăng ký sớm?',
              options: [
                'Vì các lớp học phí cao',
                'Vì mỗi lớp chỉ giới hạn 40 chỗ',
                'Vì phòng học rất nhỏ',
                'Vì phải học bù vào cuối tuần',
              ],
              answer: 1,
              explanation: '"Mỗi lớp giới hạn 40 chỗ, nên các bạn hãy đăng ký sớm" — chỗ có hạn.',
            },
            {
              type: 'ESSAY',
              q: 'Nếu có thể, bạn có muốn tham gia các lớp học bổ sung này không? Vì sao? Viết khoảng 4–6 câu.',
              explanation:
                'Câu tự luận không chấm tự động — bài làm được lưu cùng lượt thi và chấm theo rubric nếu giáo viên bật chấm tay.',
            },
          ],
        },
      ],
    },
  ],
  expectTotalQuestions: 20,
  expectSectionQuestions: { 'Nghe hiểu': 10, 'Đọc hiểu': 10 },
};
