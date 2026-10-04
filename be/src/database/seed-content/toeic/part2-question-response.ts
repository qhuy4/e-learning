/**
 * TOEIC Listening — Part 2: Question–Response (25 questions, THREE options).
 *
 * Each item has its own audio placeholder material (no transcript — the
 * transcript would reveal the correct response during the test).
 */
import { SeedQuestion, mc, note } from '../types';

export interface Part2Item {
  audio: string;
  question: SeedQuestion;
}

export const PART2: Part2Item[] = [
  {
    audio: '/audio/toeic/part2-01.mp3',
    question: mc(
      'When will the shipment arrive?',
      ['Tomorrow morning.', 'By courier.', 'About thirty boxes.'],
      0,
      note(
        'Câu hỏi "when" hỏi thời điểm nên trả lời bằng thời gian: "Tomorrow morning". "By courier" trả lời phương thức giao hàng, "thirty boxes" trả lời số lượng.',
        'shipment (n) — lô hàng',
        'Dễ',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-02.mp3',
    question: mc(
      'Who is leading the negotiation?',
      ['The contract is still unsigned.', 'Ms. Tanaka, our sales director.', 'Since last Monday.'],
      1,
      note(
        'Câu hỏi "who" hỏi người nên đáp án là danh từ chỉ người: "Ms. Tanaka". Hai đáp án còn lại nói về tình trạng hợp đồng và thời gian.',
        'lead a negotiation (v) — dẫn dắt cuộc đàm phán',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-03.mp3',
    question: mc(
      'How much does the annual membership cost?',
      ['For about three years.', 'On the second floor.', 'Ninety-nine dollars per year.'],
      2,
      note(
        '"How much" hỏi giá tiền nên đáp án đúng là "$99 per year". "For three years" trả lời thời lượng, "second floor" trả lời địa điểm.',
        'membership (n) — phí thành viên',
        'Dễ',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-04.mp3',
    question: mc(
      'Why was the staff meeting postponed?',
      ['Twice a month.', 'Because the regional manager was traveling.', 'In the main hall.'],
      1,
      note(
        '"Why" hỏi lý do nên đáp án đúng bắt đầu bằng "Because…". "Twice a month" trả lời tần suất, "in the main hall" trả lời địa điểm.',
        'postpone (v) — hoãn lại',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-05.mp3',
    question: mc(
      'May I leave the office early today?',
      ['Yes, but please finish the inventory first.', 'I usually leave at six.', 'By company car.'],
      0,
      note(
        'Câu xin phép "May I…?" được trả lời bằng sự đồng ý kèm điều kiện: "Yes, but please finish…". Hai đáp án kia không phải phản hồi cho lời xin phép.',
        'inventory (n) — kiểm kê',
        'Dễ',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-06.mp3',
    question: mc(
      'How often do you back up the customer database?',
      ['The database is on the server.', 'Mr. Alvarez did it yesterday.', 'Every night before I go home.'],
      2,
      note(
        '"How often" hỏi tần suất nên đáp án đúng là "Every night…". Hai đáp án còn lại nói về nơi lưu và người thực hiện.',
        'back up (v) — sao lưu',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-07.mp3',
    question: mc(
      'Where can I pick up the office supplies?',
      ['They are ordered every month.', 'At the reception desk on the first floor.', 'If you sign this form.'],
      1,
      note(
        '"Where" hỏi địa điểm nên đáp án đúng nêu nơi nhận: "At the reception desk". Đáp án A trả lời tần suất, đáp án C trả lời điều kiện.',
        'pick up (v) — đến lấy, nhận',
        'Dễ',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-08.mp3',
    question: mc(
      'Is this seat taken?',
      ['The seats are reserved for staff.', 'No, feel free to use it.', 'Take it to the manager.'],
      1,
      note(
        'Câu hỏi Yes/No "Is this seat taken?" được trả lời trực tiếp "No, feel free…" — lịch sự và đúng ngữ cảnh chỗ ngồi trên tàu/bus.',
        'be taken (adj) — có người chiếm rồi',
        'Dễ',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-09.mp3',
    question: mc(
      'What time does the bank close today?',
      ['On Maple Avenue.', 'It closes inactive accounts.', 'At six in the evening.'],
      2,
      note(
        '"What time" hỏi thời điểm nên đáp án đúng là "At six in the evening". "Maple Avenue" trả lời địa điểm, câu B nói về việc đóng tài khoản.',
        'close (v) — đóng cửa',
        'Dễ',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-10.mp3',
    question: mc(
      'Did you submit the expense report?',
      ['To the finance office last week.', 'Not yet — I am completing it now.', 'The dinner was for clients.'],
      1,
      note(
        'Câu hỏi Yes/No về việc đã làm chưa: "Not yet — I am completing it" trả lời đúng cả ý nghĩa lẫn thì. Đáp án A thiếu chủ ngữ trả lời "did you", C giải thích việc khác.',
        'expense report (n) — báo cáo chi phí',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-11.mp3',
    question: mc(
      'Which flight are you taking to Osaka?',
      ["I'm traveling alone.", 'Business class.', 'Flight OA-218 this afternoon.'],
      2,
      note(
        '"Which flight" hỏi chuyến bay cụ thể nên đáp án đúng nêu số chuyến: "Flight OA-218". Hai đáp án kia trả lời hình thức đi và hạng ghế.',
        'flight (n) — chuyến bay',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-12.mp3',
    question: mc(
      'Would you like some coffee before we start?',
      ['The coffee machine was repaired.', 'Yes, thank you — just a little.', 'We start at nine sharp.'],
      1,
      note(
        '"Would you like…?" là lời mời nên trả lời bằng sự chấp nhận lịch sự: "Yes, thank you". Hai đáp án kia không phản hồi lời mời.',
        'Would you like…? — Bạn có muốn…?',
        'Dễ',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-13.mp3',
    question: mc(
      'Why is the photocopier not working?',
      ['It is in the third-floor office.', 'There is a paper jam in tray two.', 'It was repaired last week.'],
      1,
      note(
        '"Why" hỏi nguyên nhân: "There is a paper jam" là lý do trực tiếp khiến máy không chạy. Hai đáp án kia nói vị trí và lịch sửa chữa.',
        'paper jam (n) — kẹt giấy',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-14.mp3',
    question: mc(
      'When was the electricity bill paid?',
      ['In the pending folder.', 'For the warehouse lease.', 'Yesterday afternoon.'],
      2,
      note(
        '"When was… paid?" hỏi thời điểm quá khứ nên "Yesterday afternoon" là đáp án đúng. Đáp án A nói nơi lưu giấy tờ, B nói nội dung hóa đơn.',
        'bill (n) — hóa đơn',
        'Dễ',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-15.mp3',
    question: mc(
      'How do I get to the convention center?',
      ['Take bus number 12 and get off at Harbor Street.', 'The center opens at nine.', 'It is a very large building.'],
      0,
      note(
        '"How do I get to…?" hỏi hướng đi nên đáp án đúng chỉ đường bằng xe buýt. Hai đáp án kia trả lời giờ mở cửa và quy mô tòa nhà.',
        'get off (v) — xuống (xe)',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-16.mp3',
    question: mc(
      'Do you know where Ms. Reyes is?',
      ['She reports to Mr. Cho.', "She's attending a conference until Friday.", 'I know her very well.'],
      1,
      note(
        'Câu hỏi gián tiếp "Do you know where…?" cần trả lời bằng nơi/vị trí: "attending a conference" (ở hội thảo). Đáp án A nói quan hệ cấp trên, C nói quan hệ quen biết.',
        'attend a conference (v) — tham dự hội nghị',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-17.mp3',
    question: mc(
      "What's the weather like in Seoul this week?",
      ['Seoul is a crowded city.', 'The forecast mentions rain tomorrow.', 'Quite cold, around five degrees.'],
      2,
      note(
        '"What’s the weather like…?" hỏi thời tiết nên "Quite cold, around five degrees" là đáp án đúng. Đáp án B chỉ nói riêng ngày mai, đáp án A nói dân số.',
        'weather (n) — thời tiết',
        'Dễ',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-18.mp3',
    question: mc(
      'Shall we reschedule the interview?',
      ['The interview room is booked all week.', 'Sure — would Friday morning work for you?', 'Mr. Bianchi applied online.'],
      1,
      note(
        '"Shall we…?" đề xuất nên đáp án đúng đồng tình và gợi thời gian mới: "Sure — would Friday…". Đáp án A chỉ nêu thực tế, C nói về người nộp hồ sơ.',
        'reschedule (v) — dời lịch',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-19.mp3',
    question: mc(
      'How far is the airport from the hotel?',
      ['About forty minutes by shuttle bus.', 'Terminal 2.', 'The flight was delayed two hours.'],
      0,
      note(
        '"How far" hỏi khoảng cách/thời gian di chuyển nên "About forty minutes by shuttle bus" là đáp án đúng. Đáp án B trả lời sân bay nào, C nói chuyến bay.',
        'shuttle bus (n) — xe buýt đưa đón',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-20.mp3',
    question: mc(
      'What does the sign by the entrance say?',
      ['It hangs above the door.', '"Wet floor — please use the side entrance."', 'I signed the form yesterday.'],
      1,
      note(
        '"What does the sign say?" hỏi nội dung chữ trên biển nên đáp án B trích đúng nội dung. Đáp án A nói vị trí treo, C đánh lừa bằng từ "sign" (ký).',
        'entrance (n) — lối vào',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-21.mp3',
    question: mc(
      'Can I have a receipt for my purchase?',
      ['The sale ends on Sunday.', 'Please pay by credit card.', 'Certainly — I will print one for you.'],
      2,
      note(
        'Câu xin phép "Can I have…?" được trả lời "Certainly — I will print one" (hoàn toàn được). Hai đáp án kia nói thời hạn khuyến mãi và hình thức thanh toán.',
        'receipt (n) — biên lai, phiếu thu',
        'Dễ',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-22.mp3',
    question: mc(
      'Who will chair tomorrow’s workshop?',
      ['It lasts two hours.', 'Professor Nguyen from the community college.', 'In room 204.'],
      1,
      note(
        '"Who" hỏi người chủ trì nên đáp án đúng là danh từ chỉ người: "Professor Nguyen". Đáp án A trả lời thời lượng, C trả lời địa điểm.',
        'chair (v) — chủ trì',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-23.mp3',
    question: mc(
      'When do the new security procedures take effect?',
      ['Security guards work at night.', 'They are described in the handbook.', 'From the first of next month.'],
      2,
      note(
        '"When do… take effect?" hỏi thời điểm có hiệu lực nên "From the first of next month" là đáp án đúng. Đáp án A và C lần lượt trả lời người và nơi.',
        'take effect (v) — có hiệu lực',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-24.mp3',
    question: mc(
      'Why was the order cancelled?',
      ['The customer changed their address.', 'Because the item was out of stock.', 'Orders are shipped daily.'],
      1,
      note(
        '"Why" hỏi lý do nên đáp án B với "Because…" là đúng: hết hàng. Đáp án A đổi địa chỉ (không phải lý do hủy), C nói tần suất giao hàng.',
        'out of stock (adj) — hết hàng',
        'Trung cấp',
      ),
    ),
  },
  {
    audio: '/audio/toeic/part2-25.mp3',
    question: mc(
      'How long have you worked in the accounting department?',
      ['Since I graduated in 2021.', 'The work is quite demanding.', 'I will work on the report tonight.'],
      0,
      note(
        '"How long" hỏi thời gian nên đáp án đúng nêu mốc "Since I graduated in 2021". Đáp án B nói tính chất công việc, C nói kế hoạch buổi tối.',
        'accounting department (n) — phòng kế toán',
        'Trung cấp',
      ),
    ),
  },
];

export const PART2_COUNT = 25;
