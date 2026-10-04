/**
 * TOEIC Listening — Part 4: Talks (10 groups × 3 questions = 30).
 * Each group shares ONE audio placeholder material with a transcript.
 */
import { SeedQuestion, mc, note } from '../types';

export interface TalkGroup {
  title: string;
  audio: string;
  transcript: string;
  questions: readonly [SeedQuestion, SeedQuestion, SeedQuestion];
}

export const PART4: TalkGroup[] = [
  {
    title: 'Part 4 — Talk 1: Office maintenance announcement',
    audio: '/audio/toeic/part4-01.mp3',
    transcript: `Speaker: Attention, everyone. This is a notice from the facilities department.
Speaker: The north elevator will be out of service this weekend for scheduled maintenance.
Speaker: Employees who need to carry heavy equipment should use the freight elevator on the loading dock side.
Speaker: The work begins at eight on Saturday morning and should finish by six on Sunday evening.
Speaker: We apologize for the inconvenience. Please plan your weekend visits accordingly.
Speaker: Contact extension 2140 if you have any questions.`,
    questions: [
      mc(
        'What will happen to the north elevator this weekend?',
        ['It will be closed for maintenance.', 'It will be moved to the loading dock.', 'It will run only at night.', 'It will be replaced by a new model.'],
        0,
        note(
          '"The north elevator will be out of service this weekend for scheduled maintenance" — ngừng hoạt động để bảo trì.',
          'out of service (adj) — ngừng phục vụ',
          'Dễ',
        ),
      ),
      mc(
        'When is the maintenance expected to be completed?',
        ['By Sunday evening at six', 'Saturday morning at eight', 'Sunday morning at eight', 'Monday morning at six'],
        0,
        note(
          'Khởi động 8h sáng thứ Bảy và "should finish by six on Sunday evening" — đáp án là 18h Chủ nhật.',
          'maintenance (n) — bảo trì',
          'Trung cấp',
        ),
      ),
      mc(
        'What are employees advised to do if they carry heavy equipment?',
        ['Use the freight elevator on the loading dock side.', 'Wait until Monday to use the elevator.', 'Carry the equipment up the stairs.', 'Deliver the equipment to extension 2140.'],
        0,
        note(
          'Hướng dẫn trực tiếp: "should use the freight elevator on the loading dock side" — thang máy hàng phía cửa tải.',
          'freight elevator (n) — thang máy hàng',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 4 — Talk 2: Radio advertisement for a furniture store',
    audio: '/audio/toeic/part4-02.mp3',
    transcript: `Speaker: Are you moving into a new apartment this month? Then don't miss the Harbor Furniture clearance sale.
Speaker: From Friday through Sunday, every sofa, desk, and bookshelf in our showroom is thirty to fifty percent off.
Speaker: Delivery within the city limits is free for purchases over three hundred dollars.
Speaker: Our store on Grant Avenue is open from ten a.m. to nine p.m. during the sale.
Speaker: Quantities are limited, so come early for the best selection. Harbor Furniture — furnishing homes since 1987.`,
    questions: [
      mc(
        'What is being advertised?',
        ['A weekend sale at a furniture store', 'An apartment rental agency', 'A moving company', 'A home repair service'],
        0,
        note(
          'Toàn bộ đoạn là quảng cáo "clearance sale" của Harbor Furniture (sofa, bàn, giá sách), không phải dịch vụ khác.',
          'clearance sale (n) — đại hạ giá',
          'Dễ',
        ),
      ),
      mc(
        'What benefit do customers receive when they spend more than $300?',
        ['Free delivery inside the city', 'An extra 50 percent discount', 'A coupon for the next sale', 'Two-year warranty coverage'],
        0,
        note(
          '"Delivery within the city limits is free for purchases over three hundred dollars" — miễn phí giao hàng nội thành.',
          'delivery (n) — giao hàng',
          'Dễ',
        ),
      ),
      mc(
        'What does the speaker most likely mean by saying, "Come early for the best selection"?',
        ['Popular items may sell out quickly.', 'The store opens before ten a.m. on weekends.', 'Prices will drop again on Sunday.', 'Early customers receive a free gift.'],
        0,
        note(
          'Thông báo "Quantities are limited" (số lượng có hạn) nên "come early" nghĩa là đồ tốt sẽ hết nhanh — đến sớm để còn nhiều lựa chọn.',
          'selection (n) — sự lựa chọn, hàng hóa bày bán',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 4 — Talk 3: Airport gate change announcement',
    audio: '/audio/toeic/part4-03.mp3',
    transcript: `Speaker: Attention, passengers of flight OA-218 to Osaka.
Speaker: Your flight has been reassigned from gate 14 to gate 32, at the far end of the concourse.
Speaker: Boarding will begin at 2:40 p.m., twenty minutes later than originally scheduled.
Speaker: Passengers who need extra time may board first by showing their boarding passes at the gate.
Speaker: We thank you for your patience, and we wish you a pleasant flight.`,
    questions: [
      mc(
        'What change was announced for flight OA-218?',
        ['The boarding gate was changed to gate 32.', 'The flight was cancelled.', 'The departure city changed.', 'The ticket price was reduced.'],
        0,
        note(
          'Thay đổi duy nhất: "reassigned from gate 14 to gate 32". Giờ khởi hành chỉ lùi 20 phút, không phải hủy.',
          'reassign (v) — chuyển giao (cửa lên máy bay)',
          'Dễ',
        ),
      ),
      mc(
        'When will boarding begin?',
        ['At 2:40 p.m.', 'At 2:00 p.m.', 'At 2:20 p.m.', 'At 3:40 p.m.'],
        0,
        note(
          '"Boarding will begin at 2:40 p.m., twenty minutes later than originally" — giờ gốc 20 phút trước đó là 2:20.',
          'board (v) — lên máy bay',
          'Trung cấp',
        ),
      ),
      mc(
        'Who is invited to board first?',
        ['Passengers who need extra time.', 'Passengers in business class.', 'Passengers travelling to gate 14.', 'All passengers with large bags.'],
        0,
        note(
          'Chi tiết: "Passengers who need extra time may board first" — ưu tiên người cần thêm thời gian (người khuyết tật, trẻ nhỏ…).',
          'passenger (n) — hành khách',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 4 — Talk 4: Voicemail about a project delay',
    audio: '/audio/toeic/part4-04.mp3',
    transcript: `Speaker: Hi, Marcus, it's Linda Park returning your call.
Speaker: I spoke with the printer, and the brochure samples will not arrive until Thursday.
Speaker: That means we cannot review them before the client meeting on Wednesday afternoon.
Speaker: Suggest that we bring the digital proofs instead and e-mail the final versions afterward.
Speaker: Call me back at extension 3312 before noon if you disagree.
Speaker: Otherwise, I will inform the marketing director of the change. Thanks.`,
    questions: [
      mc(
        'Why is the woman calling?',
        ['To explain that the brochure samples will arrive late.', 'To cancel the client meeting.', 'To ask for the printer’s phone number.', 'To invite Marcus to a marketing seminar.'],
        0,
        note(
          'Lý do cuộc gọi: báo "brochure samples will not arrive until Thursday" → ảnh hưởng lịch họp.',
          'return a call (v) — gọi lại',
          'Dễ',
        ),
      ),
      mc(
        'What does the woman propose to do at the Wednesday meeting?',
        ['Show the digital proofs instead of printed samples.', 'Move the meeting to Thursday.', 'Ask the printer to work overnight.', 'Cancel the presentation entirely.'],
        0,
        note(
          '"bring the digital proofs instead and e-mail the final versions afterward" — dùng bản in số (bản mềm) thay mẫu giấy.',
          'digital proof (n) — bản in số, bản duyệt số',
          'Trung cấp',
        ),
      ),
      mc(
        'What will happen if Marcus does not call back before noon?',
        ['The woman will tell the marketing director about the change.', 'The meeting will be postponed automatically.', 'The printer will ship the samples overnight.', 'Marcus will be removed from the project.'],
        0,
        note(
          'Điều kiện rõ ràng: "Otherwise, I will inform the marketing director of the change" — không gọi lại thì cô ấy báo giám đốc.',
          'inform (v) — thông báo cho',
          'Khó',
        ),
      ),
    ],
  },
  {
    title: 'Part 4 — Talk 5: Announcement about a new cafeteria',
    audio: '/audio/toeic/part4-05.mp3',
    transcript: `Speaker: Good morning. I am happy to announce that our new employee cafeteria opens next Monday.
Speaker: It is located on the ground floor, next to the fitness center.
Speaker: Breakfast is served from seven to nine, and lunch from eleven thirty to two.
Speaker: Meals are subsidized for staff, so a full lunch costs only four dollars.
Speaker: Vegetarian and low-salt options will be available every day.
Speaker: We hope to see you there. Enjoy your meal planning!`,
    questions: [
      mc(
        'Where will the cafeteria be located?',
        ['On the ground floor beside the fitness center', 'On the top floor of the office', 'Across the street from the building', 'Inside the fitness center'],
        0,
        note(
          'Địa điểm: "on the ground floor, next to the fitness center" — cạnh phòng gym, không ở trong phòng gym.',
          'cafeteria (n) — căng tin',
          'Dễ',
        ),
      ),
      mc(
        'How much will a full lunch cost an employee?',
        ['Four dollars', 'Eleven dollars', 'Two dollars', 'Seven dollars'],
        0,
        note(
          '"a full lunch costs only four dollars" nhờ được công ty trợ giá (subsidized); 7–9 và 11:30–2 là giờ ăn.',
          'subsidized (adj) — được trợ giá',
          'Trung cấp',
        ),
      ),
      mc(
        'What can be inferred about the cafeteria menu?',
        ['It will cater to different dietary needs.', 'It will serve only hot meals.', 'It will be closed on weekends.', 'It will offer free breakfast for visitors.'],
        0,
        note(
          'Suy luận từ "vegetarian and low-salt options … every day" → thực đơn đáp ứng nhiều nhu cầu ăn uống khác nhau.',
          'dietary need (n) — nhu cầu ăn uống đặc biệt',
          'Khó',
        ),
      ),
    ],
  },
  {
    title: 'Part 4 — Talk 6: Weather and traffic radio report',
    audio: '/audio/toeic/part4-06.mp3',
    transcript: `Speaker: Here is the morning update for drivers in the metro area.
Speaker: A stretch of the inbound Highway 9 is closed after an accident near Exit 12.
Speaker: Police expect the lanes to reopen by seven thirty, but delays are already building.
Speaker: Meanwhile, the forecast calls for heavy rain after noon, so keep your headlights on.
Speaker: Bus riders: three downtown routes are detoured around the closed interchange.
Speaker: We will bring you another update in thirty minutes.`,
    questions: [
      mc(
        'Why is Highway 9 closed?',
        ['An accident occurred near Exit 12.', 'Road construction started overnight.', 'Heavy rain flooded the lanes.', 'A parade blocks the downtown routes.'],
        0,
        note(
          'Nguyên nhân: "closed after an accident near Exit 12"; trời mưa chỉ là dự báo sau buổi trưa.',
          'accident (n) — tai nạn',
          'Dễ',
        ),
      ),
      mc(
        'What does the speaker advise drivers to do after noon?',
        ['Turn on their headlights because of heavy rain.', 'Avoid Highway 9 until evening.', 'Take the bus downtown.', 'Leave work before noon.'],
        0,
        note(
          'Khuyên: "the forecast calls for heavy rain after noon, so keep your headlights on" — bật đèn pha khi trời mưa.',
          'headlight (n) — đèn pha xe',
          'Dễ',
        ),
      ),
      mc(
        'What are bus passengers on the three downtown routes advised to expect?',
        ['Detours around the closed interchange.', 'Free rides for the rest of the week.', 'Additional buses every ten minutes.', 'A suspension of service until 7:30.'],
        0,
        note(
          'Thông tin giao thông công cộng: "three downtown routes are detoured around the closed interchange" — phải đi vòng.',
          'detour (v/n) — đi vòng, đường vòng',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 4 — Talk 7: New remote-work policy',
    audio: '/audio/toeic/part4-07.mp3',
    transcript: `Speaker: This is a reminder from the human resources department about our updated flexible-work policy.
Speaker: Starting next month, employees may work from home up to two days per week.
Speaker: You must submit your remote days by Friday each week, and your manager must approve them.
Speaker: Please note that meetings scheduled before ten a.m. will still be held in person.
Speaker: Equipment such as monitors may be borrowed from IT for home use.
Speaker: Full details are posted on the intranet under "Policies."`,
    questions: [
      mc(
        'How many days per week may employees work from home?',
        ['Up to two days', 'Exactly five days', 'One day per month', 'Unlimited days without approval'],
        0,
        note(
          'Giới hạn rõ: "may work from home up to two days per week" — tối đa hai ngày/tuần.',
          'flexible-work policy (n) — chính sách làm việc linh hoạt',
          'Dễ',
        ),
      ),
      mc(
        'What must employees do to work remotely?',
        ['Submit their remote days and obtain their manager’s approval.', 'Buy their own monitors.', 'Cancel all morning meetings.', 'Work from home only on Fridays.'],
        0,
        note(
          'Thủ tục: "submit your remote days by Friday … and your manager must approve them" — xin trước và được sếp duyệt.',
          'approve (v) — phê duyệt',
          'Trung cấp',
        ),
      ),
      mc(
        'What does the speaker say about morning meetings?',
        ['Those before 10 a.m. are still held in person.', 'They are cancelled during the pilot.', 'They may be held from home.', 'They will start at ten every day.'],
        0,
        note(
          'Ngoại lệ: mọi cuộc họp trước 10 giờ sáng "will still be held in person" — không được họp từ nhà.',
          'in person (adv) — trực tiếp',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 4 — Talk 8: Advertisement for a training course',
    audio: '/audio/toeic/part4-08.mp3',
    transcript: `Speaker: Want to improve your presentation skills before the next review season?
Speaker: Greenfield Academy is offering a two-day workshop on public speaking and slide design.
Speaker: The course runs on the fourteenth and twenty-first of this month, from nine to four.
Speaker: Participants will practice on camera and receive individual feedback from the instructor.
Speaker: Early registration is one hundred ninety-nine dollars; the regular price is two hundred fifty.
Speaker: Visit our Web site or call 555-0142 to reserve your seat. Space is limited.`,
    questions: [
      mc(
        'What is the workshop about?',
        ['Public speaking and slide design', 'Computer networking', 'Financial accounting', 'Foreign languages'],
        0,
        note(
          'Chủ đề nêu rõ: "a two-day workshop on public speaking and slide design" — kỹ năng thuyết trình.',
          'presentation skills (n) — kỹ năng thuyết trình',
          'Dễ',
        ),
      ),
      mc(
        'How much can a participant save by registering early?',
        ['Fifty-one dollars', 'Ninety-nine dollars', 'Two hundred fifty dollars', 'Four hundred dollars'],
        0,
        note(
          'Giá sớm 199$ vs giá thường 250$ → tiết kiệm 51 đô la.',
          'early registration (n) — đăng ký sớm',
          'Trung cấp',
        ),
      ),
      mc(
        'What will course participants do during the training?',
        ['Practice on camera and get personal feedback.', 'Write financial reports.', 'Design the academy’s Web site.', 'Teach the next class themselves.'],
        0,
        note(
          'Hoạt động thực hành: "practice on camera and receive individual feedback from the instructor" — luyện tập và nhận phản hồi cá nhân.',
          'feedback (n) — phản hồi',
          'Dễ',
        ),
      ),
    ],
  },
  {
    title: 'Part 4 — Talk 9: Opening speech at a conference',
    audio: '/audio/toeic/part4-09.mp3',
    transcript: `Speaker: Welcome, everyone, to the Coastal Region Business Conference.
Speaker: Over the next two days, more than forty speakers will share research on sustainable growth.
Speaker: Please note that session rooms open fifteen minutes before each talk, and latecomers should sit in the back rows.
Speaker: The exhibition hall on level two stays open until six this evening.
Speaker: If you lose your badge, visit the registration desk to have a replacement printed.
Speaker: Thank you for joining us, and enjoy the program.`,
    questions: [
      mc(
        'Who is the audience most likely made up of?',
        ['Businesspeople attending a regional conference', 'Students attending a language class', 'Tourists checking into a hotel', 'Employees attending a safety drill'],
        0,
        note(
          'Bối cảnh: "Coastal Region Business Conference" + "more than forty speakers … sustainable growth" → khán giả là doanh nhân.',
          'attendee (n) — người tham dự',
          'Dễ',
        ),
      ),
      mc(
        'What should latecomers do?',
        ['Sit in the back rows.', 'Wait until the next session.', 'Ask for a new badge.', 'Enter through the exhibition hall.'],
        0,
        note(
          'Hướng dẫn: "latecomers should sit in the back rows" — người đến muộn ngồi hàng sau để khỏi quấy rầy.',
          'latecomer (n) — người đến muộn',
          'Dễ',
        ),
      ),
      mc(
        'What can participants do at the registration desk?',
        ['Have a replacement badge printed if theirs is lost.', 'Buy tickets for the evening program.', 'Meet the forty speakers personally.', 'Print their research papers.'],
        0,
        note(
          'Dịch vụ tại quầy: "If you lose your badge, visit the registration desk to have a replacement printed" — làm lại thẻ.',
          'badge (n) — thẻ tên, thẻ tham dự',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 4 — Talk 10: Announcement of the company charity run',
    audio: '/audio/toeic/part4-10.mp3',
    transcript: `Speaker: Hello, colleagues. It is time to lace up your shoes for our annual charity run.
Speaker: This year's five-kilometer race takes place in Riverside Park on the twenty-fifth.
Speaker: Registration is ten dollars per person, and the company will match every dollar donated.
Speaker: You may run, walk, or jog — costumes are welcome and even encouraged.
Speaker: All funds raised will go to the city children's library.
Speaker: Sign up on the notice board by the fifteenth. We hope to see you at the starting line.`,
    questions: [
      mc(
        'What event is being announced?',
        ['A five-kilometer charity race', 'A company training session', 'A children’s library opening', 'A costume design contest'],
        0,
        note(
          'Sự kiện: "our annual charity run" — giải chạy từ thiện 5 km trong công viên, không phải sự kiện khác.',
          'charity run (n) — giải chạy từ thiện',
          'Dễ',
        ),
      ),
      mc(
        'How will the funds raised be used?',
        ['They will be donated to the city children’s library.', 'They will pay for new office equipment.', 'They will fund the training session.', 'They will be matched for the costume contest.'],
        0,
        note(
          'Đích đến của quỹ: "All funds raised will go to the city children’s library"; công ty chỉ "match" (đối ứng) số tiền quyên góp.',
          'raise funds (v) — gây quỹ',
          'Dễ',
        ),
      ),
      mc(
        'What must employees do by the fifteenth?',
        ['Sign up on the notice board.', 'Finish the five-kilometer race.', 'Donate ten dollars in cash.', 'Buy a costume for the race.'],
        0,
        note(
          'Hạn chót: "Sign up on the notice board by the fifteenth" — đăng ký trước ngày 15; 10$ là phí tham dự mỗi người.',
          'sign up (v) — đăng ký',
          'Trung cấp',
        ),
      ),
    ],
  },
];

export const PART4_COUNT = 10;
