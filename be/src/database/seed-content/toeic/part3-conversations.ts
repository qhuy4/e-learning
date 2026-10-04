/**
 * TOEIC Listening — Part 3: Conversations (13 groups × 3 questions = 39).
 *
 * Each group shares ONE audio placeholder material whose `transcript` field
 * holds the full conversation ("Xem transcript" in the FE).
 */
import { SeedQuestion, mc, note } from '../types';

export interface ConversationGroup {
  title: string;
  audio: string;
  transcript: string;
  questions: readonly [SeedQuestion, SeedQuestion, SeedQuestion];
}

export const PART3: ConversationGroup[] = [
  {
    title: 'Part 3 — Conversation 1: Scheduling a job interview',
    audio: '/audio/toeic/part3-01.mp3',
    transcript: `M: Good morning, Ms. Alvarez. This is Daniel Cho from Brightline Industries.
W: Good morning, Mr. Cho. I received your e-mail about the marketing assistant position.
M: Yes. We would like to invite you for an interview. Are you available this Thursday at ten?
W: Thursday morning is fine, but I have a class until nine fifteen. Could we meet at ten thirty?
M: Ten thirty it is. Please bring two copies of your résumé and a portfolio of your work.
W: Certainly. Could you tell me who I will be meeting with?
M: You will meet with me and Ms. Okafor, our creative director. We are in Suite 410 on the fourth floor.
W: Thank you. I will see you on Thursday at ten thirty.`,
    questions: [
      mc(
        'When will the woman most likely go to the interview?',
        ['At 10:30 a.m. on Thursday', 'At 9:15 a.m. on Thursday', 'At 10:00 a.m. on Monday', 'At 4:10 p.m. on Thursday'],
        0,
        note(
          'Cô ấy có lớp đến 9:15 nên đề nghị 10:30, người đàn ông đồng ý ("Ten thirty it is") — đáp án A. 9:15 là giờ kết thúc lớp, không phải giờ phỏng vấn; 4:10 đánh lừa từ "Suite 410".',
          'interview (n) — buổi phỏng vấn',
          'Dễ',
        ),
      ),
      mc(
        'What must the woman bring to the interview?',
        ['Two résumés and a work portfolio', 'A list of references only', 'Her class schedule', 'An application fee'],
        0,
        note(
          'Chi tiết nghe được: "bring two copies of your résumé and a portfolio". Các đáp án khác không được nhắc tới trong cuộc hội thoại.',
          'portfolio (n) — bộ sưu tập tác phẩm',
          'Trung cấp',
        ),
      ),
      mc(
        'What does the man mean when he says, "Ten thirty it is"?',
        ['He agrees to the new interview time.', 'He wants to change the meeting room.', 'He asks her to call back later.', 'He will be thirty minutes late.'],
        0,
        note(
          '"…it is" là cách khẳng định một thỏa thuận: anh ấy chấp nhận 10:30. Không có ý định đổi phòng hay hoãn.',
          'agree to (v) — đồng ý với',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 2: Moving to a new office building',
    audio: '/audio/toeic/part3-02.mp3',
    transcript: `W: Have you seen the memo about our department moving to the new building?
M: Yes. We move on Saturday the fourteenth, and I have already started packing my files.
W: I am worried about the computers. Who will disconnect them?
M: The IT team will handle the equipment, but we have to remove personal items ourselves.
W: That makes sense. Do you know anything about parking over there?
M: Employees must register for a new parking permit online before Friday, or the garage gate will not open for them.`,
    questions: [
      mc(
        'When will the department move?',
        ['On Saturday the fourteenth', 'On Friday the thirteenth', 'On the last day of the month', 'After the IT team finishes packing'],
        0,
        note(
          'Câu trả lời trực tiếp: "We move on Saturday the fourteenth". "Before Friday" chỉ là hạn đăng ký gửi xe, không phải ngày dọn.',
          'move (v) — chuyển văn phòng',
          'Dễ',
        ),
      ),
      mc(
        'What must employees do before Friday?',
        ['Register for a new parking permit online.', 'Disconnect their computers.', 'Return their old office keys.', 'Pack all IT equipment.'],
        0,
        note(
          '"register for a new parking permit online before Friday" là yêu cầu bắt đầu. Việc tháo máy tính là của đội IT, đồ đạc cá nhân tự mang.',
          'parking permit (n) — giấy phép đỗ xe',
          'Trung cấp',
        ),
      ),
      mc(
        'What does the woman mean when she says, "That makes sense"?',
        ['She understands why employees pack their own belongings.', 'She wants a bigger desk in the new building.', 'She agrees to drive the IT team.', 'She thinks the memo is incorrect.'],
        0,
        note(
          '"That makes sense" = điều đó hợp lý/tôi hiểu rồi — cô ấy chấp nhận lý do tự mang đồ đạc cá nhân.',
          'make sense (v) — hợp lý, có lý',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 3: Changing a flight for a trade fair',
    audio: '/audio/toeic/part3-03.mp3',
    transcript: `M: Karen, I have to move my flight for the trade fair in Seattle.
W: No problem. Would you like to leave earlier or later?
M: Earlier, if possible. The keynote begins at nine on Monday, and I want to hear it.
W: There is a seat on the 7:40 flight on Sunday evening, but it makes two stops.
M: Two stops? How long would the whole trip take?
W: About nine hours, and you would arrive after midnight. The direct flight leaves at two on Monday afternoon.
M: In that case, I will take the direct flight and miss the keynote.
W: Shall I tell the hotel that you will check in late?
M: Yes, and please ask them to keep my room key at the front desk.`,
    questions: [
      mc(
        'Which flight will the man most likely take?',
        ['The direct flight leaving at 2:00 p.m. on Monday', 'The flight with two stops on Sunday evening', 'The 7:40 flight on Saturday morning', 'A connecting flight on Tuesday'],
        0,
        note(
          'Sau khi biết chuyến có hai điểm dừng mất 9 giờ, anh ấy nói "I will take the direct flight" — chuyến thẳng 14:00 thứ Hai.',
          'direct flight (n) — chuyến bay thẳng',
          'Dễ',
        ),
      ),
      mc(
        'Why does the man decide against the Sunday flight?',
        ['It would take nine hours and arrive after midnight.', 'The ticket costs too much.', 'His seat was already booked.', 'He must attend a dinner on Sunday.'],
        0,
        note(
          'Nhược điểm được nêu: hai điểm dừng, hành trình ~9 giờ, đến sau nửa đêm — khiến anh ấy bỏ ý định bay sớm.',
          'layover/stop (n) — điểm dừng chuyến bay',
          'Trung cấp',
        ),
      ),
      mc(
        'What does the man imply when he says, "In that case, I will take the direct flight"?',
        ['He accepts arriving too late for the keynote.', 'He has changed his mind about the trade fair.', 'He wants a refund for his ticket.', 'He will listen to the keynote online.'],
        0,
        note(
          '"In that case" = trong trường hợp đó; anh ấy chấp nhận bay buổi chiều muộn và bỏ lỡ phần phát biểu khai mạc.',
          'in that case (idiom) — trong trường hợp đó',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 4: A delayed wholesale order',
    audio: '/audio/toeic/part3-04.mp3',
    transcript: `W: I am calling about order 5518. It was due last Friday, and our warehouse still has not received it.
M: Let me look that up. I see it here — the order shipped on Tuesday, but the carrier reported a delay.
W: A delay? Our store runs out of this item by Wednesday at the latest.
M: I understand. The truck broke down near Denver, so the revised delivery date is Thursday.
W: That is unacceptable. Customers are already asking for refunds.
M: May I send thirty units by express courier this evening? They would arrive tomorrow at nine.
W: Please do, and e-mail me the tracking number as soon as possible.`,
    questions: [
      mc(
        'What problem does the caller report?',
        ['Her warehouse has not received order 5518.', 'Her invoice was charged twice.', 'The carrier lost the payment record.', 'Her customers ordered the wrong item.'],
        0,
        note(
          'Vấn đề nêu ngay câu đầu: "order 5518 … our warehouse still has not received it".',
          'warehouse (n) — kho hàng',
          'Dễ',
        ),
      ),
      mc(
        'What caused the delivery delay?',
        ['A truck broke down near Denver.', 'The order was never shipped.', 'The warehouse refused the delivery.', 'A snowstorm closed the highway.'],
        0,
        note(
          'Nguyên nhân trực tiếp: "The truck broke down near Denver". Đơn hàng đã rời kho thứ Ba nên B sai.',
          'break down (v) — hỏng, chết máy',
          'Dễ',
        ),
      ),
      mc(
        'What will the man most likely do next?',
        ['Send thirty units by express courier and e-mail the tracking number.', 'Cancel the customer’s order permanently.', 'Wait until Thursday to do anything.', 'Ask the warehouse to pay the refund.'],
        0,
        note(
          'Anh ấy đề nghị "send thirty units by express courier this evening" và cô ấy đồng ý kèm yêu cầu gửi mã theo dõi qua e-mail.',
          'tracking number (n) — mã vận đơn',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 5: Reviewing an e-mail campaign',
    audio: '/audio/toeic/part3-05.mp3',
    transcript: `M: So, Dana, how did the spring e-mail campaign perform?
W: We sent two hundred thousand messages and achieved a click-through rate of four percent.
M: Four percent? Last year it was only two point five. What changed?
W: We personalized the subject lines and tested two different images.
M: Which image performed better?
W: The photo of the office worker doubled the clicks in the over-fifty age group.
M: Excellent. Can we apply the same idea to our social media ads?
W: Yes, but the design team needs one week to prepare the new graphics.`,
    questions: [
      mc(
        "What was the campaign's click-through rate?",
        ['Four percent', 'Two point five percent', 'Forty percent', 'Two hundred percent'],
        0,
        note(
          'Số liệu nghe được: "a click-through rate of four percent"; 2,5% là con số của năm ngoái, 200.000 là số tin nhắn đã gửi.',
          'click-through rate (n) — tỷ lệ nhấp chuột',
          'Dễ',
        ),
      ),
      mc(
        'According to the woman, why did the campaign improve?',
        ['The subject lines were personalized and two images were tested.', 'More messages were sent than last year.', 'The campaign targeted students only.', 'The design team worked on weekends.'],
        0,
        note(
          'Lý do nêu rõ: "personalized the subject lines and tested two different images" — không phải do số lượng tin gửi.',
          'personalize (v) — cá nhân hóa',
          'Trung cấp',
        ),
      ),
      mc(
        'What will probably happen next?',
        ['The design team will prepare graphics for the social media ads.', 'The e-mail campaign will be cancelled.', 'The over-fifty age group will be excluded.', 'Two hundred thousand more messages will be sent.'],
        0,
        note(
          'Kết luận cuộc họp: áp dụng ý tưởng cho quảng cáo mạng xã hội, và đội thiết kế "needs one week to prepare the new graphics".',
          'apply an idea to (v) — áp dụng ý tưởng vào',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 6: A network outage',
    audio: '/audio/toeic/part3-06.mp3',
    transcript: `W: The network has been down for twenty minutes. Nobody in sales can reach the customer database.
M: I know. Our service provider reported an outage in the downtown area.
W: Can we switch to the backup connection?
M: We can, but it is slower, and file transfers take twice as long.
W: That is still better than nothing. Please turn it on now.
M: Done. I will also post a notice so employees know the e-mail delays are temporary.
W: Thank you. Please update me the moment the main line is restored.`,
    questions: [
      mc(
        'What is the main problem described in the conversation?',
        ['The main network connection is not working.', 'The sales team deleted the database.', 'The service provider doubled its prices.', 'Employees refuse to use the database.'],
        0,
        note(
          'Mở đầu với "The network has been down for twenty minutes" và provider báo sự cố khu trung tâm.',
          'be down (adj) — bị ngừng hoạt động',
          'Dễ',
        ),
      ),
      mc(
        'What is the disadvantage of the backup connection?',
        ['File transfers take twice as long.', 'It cannot reach the customer database.', 'It costs extra money every month.', 'Only the sales team can use it.'],
        0,
        note(
          'Nhược điểm duy nhất được nêu: "it is slower, and file transfers take twice as long" — nhưng vẫn dùng được nên "better than nothing".',
          'backup connection (n) — đường truyền dự phòng',
          'Dễ',
        ),
      ),
      mc(
        'What will the man do after turning on the backup connection?',
        ['Post a notice about temporary e-mail delays.', 'Call the service provider to complain.', 'Ask employees to work from home.', 'Replace the main network cable.'],
        0,
        note(
          'Anh ấy nói "I will also post a notice so employees know the e-mail delays are temporary" — thông báo để nhân viên khỏi hoảng.',
          'post a notice (v) — dán thông báo',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 7: First day in the purchasing department',
    audio: '/audio/toeic/part3-07.mp3',
    transcript: `W: Hi, I am Rosa Delgado. Today is my first day in the purchasing department.
M: Welcome aboard, Rosa. I am Frank, the department supervisor. Did you get your security badge?
W: Not yet. The woman at the front desk said I need your signature first.
M: Of course — just sign here. IT will e-mail your network password before noon.
W: Thank you. Where can I find the supply catalogues?
M: They are on the shared drive, and printed copies are in the cabinet behind your desk.
W: Perfect. What time is the team meeting?
M: Two o'clock in conference room B. We review all new orders every Monday.`,
    questions: [
      mc(
        'What does Rosa need from Frank?',
        ['His signature on the security badge form', 'A copy of the supply catalogue', 'Her network password', 'The keys to conference room B'],
        0,
        note(
          'Lễ tân yêu cầu "you need your signature first" — Frank là người ký đơn cấp thẻ ra vào.',
          'signature (n) — chữ ký',
          'Dễ',
        ),
      ),
      mc(
        'When will Rosa receive her network password?',
        ['Before noon, by e-mail from IT', 'After the Monday meeting', 'At the end of her first week', 'From Frank in person'],
        0,
        note(
          'Chi tiết thời gian: "IT will e-mail your network password before noon".',
          'network password (n) — mật khẩu mạng',
          'Dễ',
        ),
      ),
      mc(
        'What can be inferred about Rosa’s new job?',
        ['She works in purchasing and reviews orders with the team weekly.', 'She is a temporary receptionist.', 'She supervises Frank and the IT staff.', 'She installs network equipment.'],
        0,
        note(
          'Suy luận từ "purchasing department" + "we review all new orders every Monday" → cô ấy làm mua hàng và họp rà soát đơn hàng hàng tuần.',
          'purchasing (n) — bộ phận mua hàng',
          'Khó',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 8: Third-quarter sales results',
    audio: '/audio/toeic/part3-08.mp3',
    transcript: `M: Before we close, let's go over the third-quarter numbers. Revenue rose eight percent.
W: That is good news. Which region performed best?
M: The south region, mostly because of the new dealership near the coast.
W: And the north?
M: Sales fell two percent there, mainly because of the road construction next to our store.
W: Should we raise the advertising budget in the north?
M: Let us propose a local radio campaign and revisit the figures at the next review.`,
    questions: [
      mc(
        'By how much did the company’s revenue increase?',
        ['Eight percent', 'Two percent', 'Ten percent', 'Eighteen percent'],
        0,
        note(
          '"Revenue rose eight percent"; 2% là mức giảm ở khu vực phía Bắc, không phải mức tăng.',
          'revenue (n) — doanh thu',
          'Dễ',
        ),
      ),
      mc(
        'Why did sales decrease in the north region?',
        ['Road construction took place next to the store.', 'The new dealership closed.', 'Prices were raised twice.', 'The advertising budget was cut.'],
        0,
        note(
          'Nguyên nhân nêu rõ: "mainly because of the road construction next to our store" — không phải do đại lý hay giá.',
          'construction (n) — thi công',
          'Dễ',
        ),
      ),
      mc(
        'What does the man suggest doing for the north region?',
        ['Running a local radio campaign and checking results later.', 'Closing the store immediately.', 'Moving the dealership to the coast.', 'Reducing the advertising budget.'],
        0,
        note(
          'Đề xuất: "propose a local radio campaign and revisit the figures at the next review" — quảng cáo radio và xem lại số liệu kỳ tới.',
          'propose (v) — đề xuất',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 9: Registering for a conference',
    audio: '/audio/toeic/part3-09.mp3',
    transcript: `W: Registration for the annual logistics conference closes this Friday.
M: I know. I would like to attend, but the fee is four hundred dollars.
W: Actually, for groups of three the fourth person attends free — and our team has four people.
M: Really? Then we could bring the new intern as well.
W: Exactly. Just send me the names by Wednesday so I can submit a single form.
M: Will the presentations be recorded?
W: Yes, and registered participants can download the videos for six months.`,
    questions: [
      mc(
        'When does registration for the conference close?',
        ['This Friday', 'This Wednesday', 'At the end of the month', 'On the conference day'],
        0,
        note(
          'Thông tin ở ngay câu đầu: "Registration for the annual logistics conference closes this Friday" — thứ Sáu là hạn đăng ký (thứ Tư chỉ là hạn gửi tên cho đồng nghiệp).',
          'registration (n) — đăng ký',
          'Dễ',
        ),
      ),
      mc(
        'What advantage does the group registration offer?',
        ['The fourth person on the team attends free.', 'Every participant receives a discount of $400.', 'The team can attend two conferences.', 'Videos are free for everyone.'],
        0,
        note(
          '"for groups of three the fourth person attends free" — lợi ích của đăng ký theo nhóm; không phải giảm 400 đô.',
          'attend free (v) — tham dự miễn phí',
          'Trung cấp',
        ),
      ),
      mc(
        'What will the woman probably do on Wednesday?',
        ['Submit one registration form with the names she receives.', 'Pay the four-hundred-dollar fee again.', 'Download the presentation videos.', 'Cancel the intern’s place.'],
        0,
        note(
          'Cô ấy yêu cầu "send me the names by Wednesday so I can submit a single form" — thứ Tư cô ấy nộp chung một đơn.',
          'submit a form (v) — nộp đơn',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 10: Cutting the printing budget',
    audio: '/audio/toeic/part3-10.mp3',
    transcript: `M: Our printing costs have doubled since we switched to the color copier.
W: Really? How much are we spending now?
M: Just over two thousand dollars a month, and most of it is marketing material.
W: Could we print the brochures with an outside printer instead?
M: An outside printer is cheaper per page, but we would lose the ability to make last-minute changes.
W: What if we restricted color printing to the marketing department only?
M: That is a reasonable start. I will ask everyone to enter an access code before printing.`,
    questions: [
      mc(
        'How much does the department spend on printing each month?',
        ['Just over two thousand dollars', 'About one thousand dollars', 'Exactly four thousand dollars', 'Two hundred dollars'],
        0,
        note(
          '"Just over two thousand dollars a month" — chi phí đã tăng gấp đôi kể từ khi đổi máy in màu.',
          'printing cost (n) — chi phí in ấn',
          'Dễ',
        ),
      ),
      mc(
        'What is the disadvantage of using an outside printer?',
        ['Changes cannot be made at the last minute.', 'The pages cost more to print.', 'Marketing material cannot be printed.', 'Employees need an access code.'],
        0,
        note(
          'Nhược điểm nêu rõ: "lose the ability to make last-minute changes"; ngược lại, ngoài hãng lại rẻ hơn mỗi trang.',
          'last minute (n) — phút chót',
          'Trung cấp',
        ),
      ),
      mc(
        'What solution does the man decide to implement?',
        ['Requiring an access code so only certain staff use color printing.', 'Buying a second color copier.', 'Moving all printing to an outside printer.', 'Stopping all printing for a month.'],
        0,
        note(
          'Kết luận: "restrict color printing … I will ask everyone to enter an access code" — giới hạn in màu bằng mã truy cập.',
          'restrict (v) — giới hạn',
          'Khó',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 11: Reserving a table for clients',
    audio: '/audio/toeic/part3-11.mp3',
    transcript: `W: I would like to reserve a table for six on Thursday evening. We are hosting clients from Tokyo.
M: Certainly. Do you prefer the quiet room or the terrace?
W: The quiet room, please. Our guests will want to discuss business.
M: Of course. The chef's set menu is thirty-five dollars per person and includes dessert.
W: That works. Two of our guests do not eat meat — can you arrange alternatives?
M: Absolutely. Just let us know by Tuesday, and we will prepare vegetarian dishes.
W: Perfect. Please keep the bill separate so we can pay with the company card.
M: No problem. Shall I print a copy of the menu for your guests?`,
    questions: [
      mc(
        'How many people will attend the dinner?',
        ['Six', 'Two', 'Eight', 'Thirty-five'],
        0,
        note(
          'Chi tiết số lượng: "reserve a table for six". Con số hai chỉ số khách không ăn thịt, 35 là giá mỗi suất.',
          'reserve a table (v) — đặt bàn',
          'Dễ',
        ),
      ),
      mc(
        'What must the woman do by Tuesday?',
        ['Confirm that two guests need vegetarian dishes.', 'Pay for the set menu in advance.', 'Send the menu to her clients in Tokyo.', 'Change the dinner to the terrace.'],
        0,
        note(
          '"Just let us know by Tuesday, and we will prepare vegetarian dishes" — hạn chót báo số khách ăn chay.',
          'vegetarian (adj) — chay, thuần chay',
          'Dễ',
        ),
      ),
      mc(
        'What can be inferred about the dinner?',
        ['It is a business event paid for by the company.', 'It is a private family celebration.', 'The guests will order à la carte.', 'It will take place on the terrace.'],
        0,
        note(
          'Suy luận: "hosting clients" + "discuss business" + "pay with the company card" → bữa tối công việc do công ty chi trả.',
          'host (v) — tiếp đãi',
          'Khó',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 12: Feedback on a training workshop',
    audio: '/audio/toeic/part3-12.mp3',
    transcript: `M: How was the spreadsheet workshop yesterday?
W: Useful, but the room was too crowded and the trainer spoke very quickly.
M: How many people showed up?
W: Forty, even though we had planned for twenty-five.
M: Should we run the session again next month?
W: Definitely — this time with a larger room and printed handouts, so people can follow at their own pace.
M: I will ask the training coordinator to book the auditorium instead.`,
    questions: [
      mc(
        'How many employees attended the workshop?',
        ['Forty', 'Twenty-five', 'Fifteen', 'Sixty-five'],
        0,
        note(
          '"Forty, even though we had planned for twenty-five" — 40 người thực tham dự, 25 là số dự kiến.',
          'show up (v) — xuất hiện, tham dự',
          'Dễ',
        ),
      ),
      mc(
        'What two changes does the woman suggest for the next session?',
        ['A larger room and printed handouts', 'A shorter session and online videos', 'More trainers and higher fees', 'Fewer participants and a smaller room'],
        0,
        note(
          'Đề xuất cụ thể: "a larger room and printed handouts" — giải quyết việc chật chỗ và tốc độ giảng nhanh.',
          'handout (n) — tài liệu phát tay',
          'Dễ',
        ),
      ),
      mc(
        'What will the man probably do next?',
        ['Ask the coordinator to reserve the auditorium.', 'Cancel the workshop series.', 'Ask the trainer to speak more slowly this month.', 'Plan for sixty participants in the same room.'],
        0,
        note(
          'Việc cần làm ngay: "I will ask the training coordinator to book the auditorium instead".',
          'auditorium (n) — hội trường',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 3 — Conversation 13: Complaining about a damaged delivery',
    audio: '/audio/toeic/part3-13.mp3',
    transcript: `W: Customer service, this is Amanda speaking.
M: Hi, Amanda. I received the desk lamp this morning, but the shade is cracked.
W: I am sorry to hear that. Could you give me your order number, please?
M: It is PR-90812. I placed the order last Monday.
W: Thank you. I can send a replacement today, and you may keep the damaged lamp as a spare.
M: Is there anything I should do with the broken one?
W: If you could e-mail us a photo of the crack, it would help us check the production batch.
M: I will send it within the hour.`,
    questions: [
      mc(
        'What is wrong with the product the man received?',
        ['The lamp shade is cracked.', 'The lamp is the wrong color.', 'The order arrived a week late.', 'The lamp is missing its bulb.'],
        0,
        note(
          'Sự cố nêu rõ: "the shade is cracked" (vỡ/nứt chụp đèn) — không phải sai màu hay trễ hạn.',
          'cracked (adj) — nứt, vỡ',
          'Dễ',
        ),
      ),
      mc(
        'What does the customer service representative offer?',
        ['A replacement lamp today, while the man keeps the damaged one.', 'A full refund without a replacement.', 'A discount on the next purchase only.', 'A repair appointment next week.'],
        0,
        note(
          '"I can send a replacement today, and you may keep the damaged lamp" — đổi mới ngay và không cần trả đồ hỏng.',
          'replacement (n) — hàng thay thế',
          'Trung cấp',
        ),
      ),
      mc(
        'What does the man agree to do about the damaged lamp?',
        ['E-mail a photo of the crack to the company.', 'Return the lamp to the store.', 'Pay for the replacement lamp.', 'Throw the damaged lamp away.'],
        0,
        note(
          'Anh ấy kết thúc: "I will send it within the hour" — gửi ảnh chụp phần nứt trong vòng một giờ.',
          'within an hour (phrase) — trong vòng một giờ',
          'Trung cấp',
        ),
      ),
    ],
  },
];

export const PART3_COUNT = 13;
