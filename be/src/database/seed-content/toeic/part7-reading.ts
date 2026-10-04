/**
 * TOEIC Reading — Part 7: Reading Comprehension (54 questions).
 *
 * 5 single passages (3/3/4/4 = 14... see counts below) + 4 double passages
 * (4/4/5/5 = 18) + 3 triple passages (6/6/6 = 18) = 54.
 *
 * NOTE: the requested single-passage split "3/3/4/4/5" plus 4/4/5/5 plus
 * 6/6/6 sums to 55, not 54 — the LAST single passage therefore carries 4
 * questions (3/3/4/4/4 = 18) so that Part 7 = 54 and the exam = 200.
 *
 * Required passage types are all covered: E-mail, Advertisement, Notice,
 * Web site, Article, Chat conversation.
 */
import { SeedQuestion, mc, note } from '../types';

export interface Part7Group {
  title: string;
  kind: 'single' | 'double' | 'triple';
  /** 1–3 related texts; rendered as PASSAGE materials ("Text 1/2/3"). */
  texts: readonly string[];
  questions: readonly SeedQuestion[];
}

export const PART7: Part7Group[] = [
  /* ------------------------------ SINGLE ------------------------------ */
  {
    title: 'Part 7 — Single Text 1: E-mail (fire drill procedure)',
    kind: 'single',
    texts: [
      `From: Mei Tanaka <m.tanaka@brightoffice.com>
To: All Staff
Subject: Updated Fire Drill Procedure

Dear colleagues,

As part of our annual safety review, we will hold a fire drill this Thursday at 2:00 p.m. When the alarm sounds, please leave the building through the nearest exit and gather in the parking area across from the main gate. The elevators will be switched off during the drill.

Supervisors must confirm that every member of their team is outside before anyone returns to a desk. The drill should take no more than fifteen minutes. If you are expecting an important client call, notify the facilities office in advance so that we can assign you to the recovery team.

Thank you for your cooperation.

Mei Tanaka
Office Manager`,
    ],
    questions: [
      mc(
        'What is the main purpose of Ms. Tanaka’s e-mail?',
        ['To announce a change in working hours', 'To inform staff about Thursday’s fire drill', 'To invite clients to a safety seminar', 'To report a broken alarm system'],
        1,
        note(
          'Mục đích chính là thông báo quy trình diễn tập cứu hỏa (giờ, lối thoát, tập trung) — không đổi giờ làm, không mời khách, không báo hỏng.',
          'fire drill (n) — diễn tập phòng cháy',
          'Dễ',
        ),
      ),
      mc(
        'Where should employees gather after leaving the building?',
        ['In the lobby on the first floor', 'In the training room', 'In the parking area across from the main gate', 'Behind the loading dock'],
        2,
        note(
          'Chi tiết nghe/đọc được: "gather in the parking area across from the main gate" — bãi đỗ đối diện cổng chính.',
          'gather (v) — tập trung',
          'Dễ',
        ),
      ),
      mc(
        'What must supervisors do before employees return to their desks?',
        ['Confirm that every team member is outside', 'Call each client back personally', 'Switch the elevators back on', 'Lead the recovery team first'],
        0,
        note(
          '"Supervors must confirm that every member of their team is outside" — quản lý phải điểm danh trước khi vào lại.',
          'confirm (v) — xác nhận',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 7 — Single Text 2: Advertisement (hotel meeting package)',
    kind: 'single',
    texts: [
      `THE GRAND MERIDIAN HOTEL
Business Meetings, Made Easy

Host your next seminar at the Grand Meridian, just ten minutes from the international airport.

• Eight fully equipped meeting rooms, from 6 to 200 guests
• Complimentary high-speed Internet and on-site technical support
• Set menus from $18 per person, with vegetarian options available
• Free parking for all day guests

Book before March 31 and receive a 15% discount on room rates for your attendees.

To check availability, call 555-0188 or visit www.grandmeridian.com/meetings.`,
    ],
    questions: [
      mc(
        'What do guests receive if they book before March 31?',
        ['A 15 percent discount on guest-room rates', 'Free set menus for every attendee', 'A complimentary airport transfer', 'Two extra meeting rooms'],
        0,
        note(
          'Ưu đãi kèm hạn: "Book before March 31 and receive a 15% discount on room rates".',
          'discount (n) — chiết khấu, giảm giá',
          'Dễ',
        ),
      ),
      mc(
        'How many guests can the largest meeting room hold?',
        ['Six', 'Eighteen', 'Two hundred', 'Fifty-five'],
        2,
        note(
          '"Eight fully equipped meeting rooms, from 6 to 200 guests" — sức chứa lớn nhất là 200; 18 là giá suất ăn, 555 là số điện thoại.',
          'guest (n) — khách tham dự',
          'Dễ',
        ),
      ),
      mc(
        'What is the main purpose of the advertisement?',
        ['To recruit event planners', 'To promote the hotel’s meeting facilities', 'To announce a new restaurant', 'To apologize for construction work'],
        1,
        note(
          'Toàn bộ quảng cáo nêu lợi thế phòng họp, Internet, ăn uống, bãi đỗ + lời kêu gọi đặt phòng → quảng bá dịch vụ họp hội của khách sạn.',
          'facility (n) — cơ sở vật chất',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 7 — Single Text 3: Notice (west parking lot closure)',
    kind: 'single',
    texts: [
      `NOTICE
To: All Employees
From: Facilities Management
Date: October 3

RE: West Parking Lot Closure

The west parking lot will be closed from October 12 to October 15 for resurfacing. During this period, please park in the east lot or on Grant Street. The first two levels of the garage will be reserved for visitors only.

Employees with disabilities may continue to use the accessible spaces beside Building C. Bicycle racks will be moved temporarily to the courtyard.

We recommend allowing an extra ten minutes for parking during the closure. Thank you for your patience while we improve the facility.`,
    ],
    questions: [
      mc(
        'When will the west parking lot be closed?',
        ['October 3 to October 10', 'October 12 to October 15', 'From October 15 onward', 'Only on weekend nights'],
        1,
        note(
          'Thời gian rõ ràng: "closed from October 12 to October 15 for resurfacing" — ngày 3 chỉ là ngày ban hành thông báo.',
          'resurfacing (n) — trải lại mặt đường',
          'Dễ',
        ),
      ),
      mc(
        'Who may use the first two levels of the garage during the closure?',
        ['Employees with disabilities', 'Visitors only', 'Bicycle owners', 'Facilities staff'],
        1,
        note(
          '"The first two levels of the garage will be reserved for visitors only" — chỉ khách vãng lai; xe khuyết tật dùng chỗ cạnh Tòa C.',
          'reserved (adj) — dành riêng',
          'Dễ',
        ),
      ),
      mc(
        'What are employees advised to do?',
        ['Arrive ten minutes earlier than usual', 'Leave work before the closure', 'Move their bicycles to Grant Street', 'Share cars with the facilities team'],
        0,
        note(
          'Khuyến nghị: "allowing an extra ten minutes for parking" — đến sớm thêm 10 phút vì phải tìm chỗ khác.',
          'allow extra time (v) — bố trí thêm thời gian',
          'Trung cấp',
        ),
      ),
      mc(
        'What is the purpose of the notice?',
        ['To explain a temporary change in parking arrangements', 'To announce the opening of a new garage', 'To sell parking passes to employees', 'To apologize for a broken elevator'],
        0,
        note(
          'Thông báo giải thích chỗ đỗ thay đổi tạm thời (đóng bãi Tây, bãi tạm, chỗ dành cho xe khuyết tật) trong thời gian trải lại mặt đường.',
          'arrangement (n) — sự sắp xếp',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 7 — Single Text 4: Article (the four-day workweek trial)',
    kind: 'single',
    texts: [
      `HARBOR INSURANCE KEEPS ITS FOUR-DAY WORKWEEK

After a year-long trial, Harbor Insurance has decided to keep its four-day workweek. The company tested the schedule with 120 employees in its claims department, cutting hours without cutting pay.

Productivity rose 12 percent during the trial, and sick days fell by nearly a third. Customers reported shorter wait times because supervisors staggered shifts so that coverage actually increased.

Not everyone was convinced at the start. Supervisors worried about training new staff, and some employees feared that salaries would eventually be reduced. Neither prediction has come true so far.

Harbor now plans to extend the program to two more departments next spring. Industry analysts say that at least a dozen regional firms are watching the results closely.`,
    ],
    questions: [
      mc(
        'What is the article mainly about?',
        ['A successful change to a shorter workweek', 'A rise in insurance premiums', 'A training program for supervisors', 'A reduction in company salaries'],
        0,
        note(
          'Ý chính: thử nghiệm 4 ngày/tuần thành công và được giữ lại — các chi tiết (năng suất, nghỉ ốm) chỉ là bằng chứng.',
          'productivity (n) — năng suất',
          'Dễ',
        ),
      ),
      mc(
        'What happened to sick days during the trial?',
        ['They rose by 12 percent', 'They were cut in half', 'They fell by nearly a third', 'They remained unchanged'],
        2,
        note(
          '"sick days fell by nearly a third" — giảm gần 1/3; con số 12% là mức tăng năng suất.',
          'sick day (n) — ngày nghỉ ốm',
          'Trung cấp',
        ),
      ),
      mc(
        'Why did customer wait times decrease?',
        ['Because shifts were staggered to increase coverage', 'Because the company hired more staff', 'Because customers used an online service', 'Because hours were increased for some teams'],
        0,
        note(
          'Nguyên nhân nêu trong bài: "supervisors staggered shifts so that coverage actually increased" — xếp lệch giờ ca để luôn có người trực.',
          'stagger shifts (v) — xếp lệch ca làm việc',
          'Khó',
        ),
      ),
      mc(
        'What can be inferred about the supervisors’ original concerns?',
        ['They have not been realized during the trial', 'They led to salary reductions', 'They caused the program to end early', 'They were shared by the customers'],
        0,
        note(
          'Bài viết khẳng định "Neither prediction has come true so far" → lo ngại về đào tạo và cắt lương đều chưa thành hiện thực.',
          'prediction (n) — dự đoán',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 7 — Single Text 5: Web site (shipping & returns policy)',
    kind: 'single',
    texts: [
      `HELP CENTER — SHIPPING & RETURNS

Delivery options
Standard delivery (3–5 business days): $5.99 — free on orders over $50.
Express delivery (1–2 business days): $14.99.
Same-day delivery inside the city center: $19.99, for orders placed before noon.

Track your order
A tracking number arrives by e-mail as soon as your order leaves the warehouse. Enter it in the "Track Order" box on this page.

Returns
Unused items may be returned within 30 days with the original receipt. Refunds go back to the original payment method within five business days. Sale items and opened software cannot be returned.

Questions? Contact support@northline.example or call 800-555-0174.`,
    ],
    questions: [
      mc(
        'How much does express delivery cost?',
        ['$5.99', '$14.99', '$19.99', '$50.00'],
        1,
        note(
          '"Express delivery (1–2 business days): $14.99" — $5.99 là tiêu chuẩn, $19.99 là giao trong ngày, $50 là ngưỡng miễn phí.',
          'express delivery (n) — giao hàng nhanh',
          'Dễ',
        ),
      ),
      mc(
        'When is same-day delivery available?',
        ['For orders placed before noon inside the city center', 'For orders over $50 only', 'Everywhere, seven days a week', 'Only for returned items'],
        0,
        note(
          'Điều kiện kép: "inside the city center" + "for orders placed before noon".',
          'same-day delivery (n) — giao trong ngày',
          'Trung cấp',
        ),
      ),
      mc(
        'What must a customer have to return an unused item?',
        ['A tracking number', 'The original receipt', 'A support ticket', 'An opened box'],
        1,
        note(
          '"Unused items may be returned within 30 days with the original receipt" — cần biên lai gốc và trong vòng 30 ngày.',
          'original receipt (n) — biên lai gốc',
          'Dễ',
        ),
      ),
      mc(
        'A customer tries to return opened software. What will happen?',
        ['The request will be refused', 'The customer will get store credit only', 'The refund will arrive in five days', 'Support will replace it free of charge'],
        0,
        note(
          'Chính sách nêu rõ "opened software cannot be returned" → yêu cầu hoàn trả sẽ bị từ chối.',
          'refund (n) — tiền hoàn',
          'Trung cấp',
        ),
      ),
    ],
  },

  /* ------------------------------ DOUBLE ------------------------------ */
  {
    title: 'Part 7 — Double Text 1: E-mail + Chat conversation (database workshop)',
    kind: 'double',
    texts: [
      `From: Rachel Osei <r.osei@vantagepartners.com>
To: Product Team
Subject: Workshop on the new database

Hi everyone,

Our database workshop, originally set for Tuesday, has been moved to Thursday at 10 a.m., room 3B. The trainer, Mr. Whitfield, will cover the new search tools in the first hour and take questions afterward.

Please bring your laptops. If you cannot attend, send your questions to me by Wednesday so that I can pass them to the trainer. A recording will be posted on the intranet by Friday.

Rachel`,
      `[2:14 PM] Liam: Are you going to the database workshop on Tuesday?
[2:15 PM] Sofia: There isn't one on Tuesday — Rachel moved it to Thursday, 10 a.m., room 3B.
[2:15 PM] Liam: Good thing you told me. I almost gave our intern the wrong day. Anything to prepare?
[2:16 PM] Sofia: Just your laptop. And if you can't come, send Rachel your questions by Wednesday.
[2:17 PM] Liam: Perfect — see you Thursday.`,
    ],
    questions: [
      mc(
        'When will the database workshop take place?',
        ['Tuesday at 10 a.m.', 'Wednesday morning', 'Thursday at 10 a.m.', 'Friday afternoon'],
        2,
        note(
          'E-mail nói rõ "moved to Thursday at 10 a.m., room 3B" — thứ Ba là lịch cũ.',
          'workshop (n) — hội thảo tập huấn',
          'Dễ',
        ),
      ),
      mc(
        'What does Sofia mean when she says, "There isn’t one on Tuesday"?',
        ['The workshop has been rescheduled.', 'The room is already booked.', 'The trainer has cancelled the course.', 'The intern must attend instead.'],
        0,
        note(
          'Cô ấy đính chính: buổi học đã dời sang thứ Năm → "không có buổi nào vào thứ Ba" (nói về lịch cũ).',
          'reschedule (v) — dời lịch',
          'Trung cấp',
        ),
      ),
      mc(
        'What must participants bring to the session?',
        ['Their laptops', 'Printed manuals', 'A written test', 'Lunch for the trainer'],
        0,
        note(
          'Yêu cầu vật dụng duy nhất: "Please bring your laptops" (lặp lại trong đoạn chat).',
          'laptop (n) — máy tính xách tay',
          'Dễ',
        ),
      ),
      mc(
        'What can a participant do if unable to attend?',
        ['Watch the recording on the intranet by Friday', 'Receive a printed handout by Tuesday', 'Attend a second session on Monday', 'Ask the intern to take notes for credit'],
        0,
        note(
          'E-mail nêu hai phương án: gửi câu hỏi trước (để truyền đạt) và "A recording will be posted on the intranet by Friday".',
          'recording (n) — bản ghi âm/ghi hình',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 7 — Double Text 2: Advertisement + Notice (bike tune-up & roadworks)',
    kind: 'double',
    texts: [
      `CITY CYCLES — SPRING SERVICE SPECIAL

Is your bike ready for spring? Book a full tune-up before April 30 and get 20% off the regular price of $65.

Our mechanics check brakes, gears, and tire pressure, and clean the chain free of charge. Most repairs are finished the same day if you drop off your bike before 10 a.m.

City Cycles, 118 King Street. Open Tuesday to Sunday, 9 a.m. to 6 p.m.`,
      `NOTICE — KING STREET ROADWORKS

King Street between Pine Avenue and the river bridge will be closed to traffic from May 3 to May 20 while the road surface is repaired.

Pedestrians may use the temporary crossing at Pine Avenue. Businesses on King Street will remain open, and delivery access will be granted from the river side.

City Cycles thanks its customers for their understanding and offers free pickup within two kilometres during the closure.`,
    ],
    questions: [
      mc(
        'What is the discounted price of a full tune-up?',
        ['$52', '$65', '$48', '$78'],
        0,
        note(
          'Giá gốc $65 trừ 20% = $52 (20% của 65 là 13).',
          'tune-up (n) — bảo dưỡng tổng thể',
          'Trung cấp',
        ),
      ),
      mc(
        'When will King Street be closed to traffic?',
        ['From May 3 to May 20', 'Before April 30', 'From April 30 to May 3', 'Permanently'],
        0,
        note(
          '"closed to traffic from May 3 to May 20" — lưu thông bị chặn trong khoảng này; cửa hàng vẫn mở.',
          'roadworks (n) — công trường sửa đường',
          'Dễ',
        ),
      ),
      mc(
        'A customer wants to leave a bike at City Cycles on May 10. What should the customer know?',
        ['The shop offers free pickup within two kilometres during the closure', 'The shop will be closed for the whole of May', 'Roadworks will finish before May 10', 'Repairs cost 20% more during the roadworks'],
        0,
        note(
          'Kết hợp hai văn bản: King Street đóng cửa 3–20/5, nhưng cửa hàng mở và "offers free pickup within two kilometres" — khách không phải đến tận nơi.',
          'pickup (n) — dịch vụ đến nhận tận nơi',
          'Khó',
        ),
      ),
      mc(
        'What do the two texts have in common?',
        ['Both announce a price increase', 'Both concern temporary disruption on King Street', 'Both advertise a new repair service', 'Both cancel a public event'],
        1,
        note(
          'Cả quảng cáo lẫn thông báo đều xoay quanh sự gián đoạn tạm thời trên King Street (một bên giảm giá vì lý do đó, một bên giải thích việc đóng đường).',
          'disruption (n) — sự gián đoạn',
          'Khó',
        ),
      ),
    ],
  },
  {
    title: 'Part 7 — Double Text 3: Article + E-mail (city e-scooters)',
    kind: 'double',
    texts: [
      `CITY E-SCOOTERS: SIX MONTHS ON

Last spring the city allowed three companies to park 1,500 electric scooters near transit stations. Riders unlock a scooter with a phone app and pay by the minute.

Supporters say the scooters cut short car trips: the transport authority estimates that 12 percent of rides replaced a drive downtown. Complaints, however, have focused on scooters left across sidewalks, which annoy pedestrians and block wheelchair users.

Since January, every scooter must be parked in one of 400 painted bays. Violations carry a $40 fine, and the operating companies must clear the bays every night.

Accidents have fallen since the bays were introduced, though doctors still treat several broken wrists each month.`,
      `From: Office of Transportation <transport@westhaven.gov>
Subject: Re: Your comment on scooter parking

Dear Ms. Alvarez,

Thank you for writing to us about scooters on Mill Road. Since the painted bays were introduced in January, our inspectors have recorded a 60 percent drop in sidewalk obstructions in that area.

We agree that the night-time clearance requirement is not yet working everywhere. Starting next month, the operator with the most violations in a district will lose its permit for that district.

You are welcome to attend the open meeting on June 12, when the results of the six-month review will be presented.

Sincerely,
Daniel Okafor
Office of Transportation`,
    ],
    questions: [
      mc(
        'What is the main topic of the article on city e-scooters?',
        ['New rules for electric scooters after six months', 'A ban on driving downtown', 'A rise in public transportation fares', 'A phone app for city parking'],
        0,
        note(
          'Ý chính: sau sáu tháng, thành phố siết quản lý xe điện (vạch đỗ, phạt, dọn hàng đêm) và tai nạn giảm.',
          'scooter (n) — xe tay ga điện',
          'Dễ',
        ),
      ),
      mc(
        'What must the operating companies do every night?',
        ['Clear the painted bays', 'Wash the scooters', 'Pay a $40 fine', 'Repaint the sidewalks'],
        0,
        note(
          '"the operating companies must clear the bays every night" — dọn xe khỏi vạch đỗ vào ban đêm.',
          'clear (v) — dọn sạch',
          'Dễ',
        ),
      ),
      mc(
        'According to the article, what proportion of scooter rides replaced a car trip?',
        ['Twelve percent', 'Forty percent', 'Sixty percent', 'Fifty percent'],
        0,
        note(
          'Số liệu: "12 percent of rides replaced a drive downtown"; 60% là mức giảm chướng ngại vật trên vỉa hè (trong e-mail).',
          'estimate (v) — ước tính',
          'Trung cấp',
        ),
      ),
      mc(
        'What change will the Office of Transportation make next month?',
        ['Operators with the most violations may lose their district permit', 'All scooters will be removed from Mill Road', 'The $40 fine will be increased to $60', 'Sidewalk parking will be allowed again'],
        0,
        note(
          'E-mail nêu: "the operator with the most violations in a district will lose its permit for that district".',
          'permit (n) — giấy phép',
          'Trung cấp',
        ),
      ),
      mc(
        'What can be inferred about Ms. Alvarez?',
        ['She had previously reported a problem on Mill Road', 'She works for the Office of Transportation', 'She plans to buy an electric scooter', 'She received a $40 parking fine'],
        0,
        note(
          'Tiêu đề thư "Re: Your comment on scooter parking" + lời cảm ơn "about scooters on Mill Road" → bà ấy từng khiếu nại về xe dựng ngay ngắn trên Mill Road.',
          'comment (n) — ý kiến, phản hồi',
          'Khó',
        ),
      ),
    ],
  },
  {
    title: 'Part 7 — Double Text 4: Web site + E-mail (online course enrollment)',
    kind: 'double',
    texts: [
      `ONLINE COURSE CATALOG — MEDIANOTE ACADEMY

Course: Business Writing Essentials
Level: Intermediate
Start dates: March 4 and April 1
Duration: 6 weeks, two live sessions per week (7–8 p.m.)
Fee: $180, including all materials and one final review
Certificate: issued to participants who finish all assignments

Your login link arrives by e-mail before the course starts. Sessions are recorded, so you may watch a class again within seven days.

Refunds are available until seven days before the start date, minus a $25 administrative fee.`,
      `From: registrar@medianote.example
To: a.johnson@example.com
Subject: Your enrollment in Business Writing Essentials

Dear Alex,

You are enrolled in the session that starts on April 1. Your login link will be sent to this address on March 27.

Please note that the April session meets on Tuesdays and Thursdays. If you need to withdraw, contact us before March 25 to receive a refund of $155.

Best regards,
The Registrar's Office`,
    ],
    questions: [
      mc(
        'How much does the Business Writing Essentials course cost?',
        ['$155', '$180', '$25', '$60'],
        1,
        note(
          '"Fee: $180, including all materials" — $155 là số tiền hoàn khi rút trước 25/3, $25 là phí hành chính.',
          'fee (n) — học phí',
          'Dễ',
        ),
      ),
      mc(
        'What will Alex receive on March 27?',
        ['A login link by e-mail', 'A certificate of completion', 'A refund of $155', 'The final assignment'],
        0,
        note(
          'E-mail xác nhận: "Your login link will be sent to this address on March 27".',
          'login link (n) — đường dẫn đăng nhập',
          'Dễ',
        ),
      ),
      mc(
        'How much would Alex be refunded if withdrawing on March 20?',
        ['$155', '$180', '$25', '$130'],
        0,
        note(
          'Rút trước 25/3 → hoàn học phí trừ phí $25: 180 − 25 = $155 (đúng mức e-mail nêu).',
          'refund (n) — tiền hoàn trả',
          'Trung cấp',
        ),
      ),
      mc(
        'What is true of the April session?',
        ['It meets twice a week, on Tuesdays and Thursdays', 'It begins on March 4', 'It has no final review', 'It cannot be watched again'],
        0,
        note(
          'E-mail ghi "the April session meets on Tuesdays and Thursdays", khớp mô tả "two live sessions per week".',
          'session (n) — buổi học, kỳ học',
          'Trung cấp',
        ),
      ),
      mc(
        'Until when are refunds available according to the catalog?',
        ['Seven days before the start date', 'Within seven days of the first class', 'Only on March 27', 'Any time during the course'],
        0,
        note(
          '"Refunds are available until seven days before the start date, minus a $25 administrative fee".',
          'refund policy (n) — chính sách hoàn tiền',
          'Trung cấp',
        ),
      ),
    ],
  },

  /* ------------------------------ TRIPLE ------------------------------ */
  {
    title: 'Part 7 — Triple Text 1: Advertisement + 2 E-mails (job application)',
    kind: 'triple',
    texts: [
      `WANTED: OFFICE COORDINATOR
Northgate Dental Group

Northgate Dental Group is looking for a full-time office coordinator to manage appointments, billing, and supplier orders.

Requirements: two years of experience in a medical office, strong spreadsheet skills, and clear written English. Evening shifts are required twice a week.

Salary: $42,000–$48,000, with health insurance after three months.
Apply online at northgatedental.example/jobs by November 30.`,
      `From: Liu Chen <l.chen@example.com>
Subject: Office coordinator position

Dear Hiring Manager,

I saw your advertisement for an office coordinator and would like to apply. I have spent three years at a family clinic, where I managed appointments and prepared insurance claims using Excel.

I am available for evening shifts and can start on December 4. My résumé is attached. Could you tell me whether the health insurance covers dental care for employees?

Sincerely,
Liu Chen`,
      `From: careers@northgatedental.example
To: l.chen@example.com
Subject: Re: Office coordinator position

Dear Ms. Chen,

Thank you for applying. Your experience matches our requirements, and we would like to invite you to a twenty-minute interview on Tuesday, December 9, at 3 p.m.

Please bring the names of two references. To answer your question: yes, our health package includes dental care for employees after three months.

If Tuesday does not suit you, please reply by Friday.

Sincerely,
Hiring Team`,
    ],
    questions: [
      mc(
        'What salary range does the job advertisement list?',
        ['$42,000–$48,000', '$30,000–$35,000', '$48,000–$52,000', '$4,200 a month'],
        0,
        note(
          'Thông tin trực tiếp trong quảng cáo: "Salary: $42,000–$48,000".',
          'salary range (n) — khoảng lương',
          'Dễ',
        ),
      ),
      mc(
        'Which requirement does Liu Chen’s experience satisfy?',
        ['Two years of experience in a medical office', 'A university degree in business', 'Evening shifts twice a week', 'Clear spoken English'],
        0,
        note(
          'Ứng viên "spent three years at a family clinic" → vượt yêu cầu "two years of experience in a medical office".',
          'requirement (n) — yêu cầu',
          'Trung cấp',
        ),
      ),
      mc(
        'When and where is the interview?',
        ['December 9 at 3 p.m.', 'November 30 online', 'December 4 in the clinic', 'Friday morning by phone'],
        0,
        note(
          'Lời mời phỏng vấn: "Tuesday, December 9, at 3 p.m." — 20 phút. 4/12 là ngày có thể bắt đầu làm việc.',
          'interview (n) — phỏng vấn',
          'Dễ',
        ),
      ),
      mc(
        'What does Liu Chen ask about in her e-mail?',
        ['Whether the health insurance covers dental care', 'How much the salary will be', 'When evening shifts begin', 'Who her supervisor will be'],
        0,
        note(
          'Câu hỏi duy nhất: "whether the health insurance covers dental care for employees".',
          'health insurance (n) — bảo hiểm y tế',
          'Trung cấp',
        ),
      ),
      mc(
        'What must Liu Chen bring to the interview?',
        ['The names of two references', 'A dental insurance form', 'Her start-date confirmation', 'A spreadsheet sample'],
        0,
        note(
          'Yêu cầu trong thư trả lời: "Please bring the names of two references".',
          'reference (n) — người giới thiệu, người tham chiếu',
          'Dễ',
        ),
      ),
      mc(
        'What should Liu Chen do if Tuesday does not suit her?',
        ['Reply to the hiring team before Friday', 'Apply for a different position', 'Attend the interview on December 4', 'Send her résumé a second time'],
        0,
        note(
          'Điều kiện cuối thư: "If Tuesday does not suit you, please reply by Friday".',
          'suit (v) — phù hợp, hợp với',
          'Dễ',
        ),
      ),
    ],
  },
  {
    title: 'Part 7 — Triple Text 2: Web site + Chat + Notice (weekend trip)',
    kind: 'triple',
    texts: [
      `SEAVIEW INN — ROOM INFORMATION

Standard room: $110 per night, one queen bed, sea view from floors 1–3
Family suite: $165 per night, two bedrooms, breakfast included
Check-in: 3 p.m. — Check-out: 11 a.m.
Free shuttle to the airport, every hour on the hour from 6 a.m.

All rooms include Wi-Fi. Pets are welcome in the family suite only, with a $20 cleaning fee.`,
      `[9:02 AM] Nina: Found a place for the weekend — Seaview Inn, $110 a night.
[9:03 AM] Omar: We're four people, so the family suite works out cheaper per person. It's $165 with breakfast.
[9:04 AM] Nina: True. Do they allow dogs? Miso is coming with us.
[9:04 AM] Omar: Only in the family suite, and there's a $20 cleaning fee.
[9:05 AM] Nina: OK, let's take the suite — and grab the free airport shuttle at 6.
[9:06 AM] Omar: Booked. Check-in is at 3, checkout at 11.`,
      `TRAVEL NOTICE — COASTAL HIGHWAY

Coastal Highway between Seaview and the harbour will be reduced to one lane from Friday to Sunday for bridge inspection.

Drivers should expect delays of up to thirty minutes. The hourly airport shuttle will use the inland route and may arrive ten minutes late.

We recommend taking the 6 a.m. shuttle if you have a morning flight.`,
    ],
    questions: [
      mc(
        'How much does the family suite cost per night?',
        ['$110', '$165', '$20', '$160'],
        1,
        note(
          'Bảng giá: "Family suite: $165 per night, two bedrooms, breakfast included" — $110 là phòng tiêu chuẩn.',
          'suite (n) — phòng suites, căn hộ khách sạn',
          'Dễ',
        ),
      ),
      mc(
        'Why does the group choose the family suite?',
        ['It works out cheaper per person and includes breakfast', 'It costs less than $110 a night', 'It allows pets without a fee', 'It has a sea view from the third floor'],
        0,
        note(
          'Lý do trong đoạn chat: "four people … cheaper per person … $165 with breakfast"; thú cưng vẫn mất phí $20 nên đáp án C sai.',
          'work out (v) — tính ra, ra (kết quả)',
          'Trung cấp',
        ),
      ),
      mc(
        'What is the $20 fee for?',
        ['Bringing a pet into the suite', 'Booking the suite online', 'Taking the airport shuttle', 'Checking in before 3 p.m.'],
        0,
        note(
          'Web ghi "Pets are welcome in the family suite only, with a $20 cleaning fee" — phí dọn lông thú cưng.',
          'cleaning fee (n) — phí dọn dẹp',
          'Dễ',
        ),
      ),
      mc(
        'What time must the group check in on the day of arrival?',
        ['At 11 a.m.', 'At 3 p.m.', 'At 6 a.m.', 'At 9 a.m.'],
        1,
        note(
          'Giờ nhận phòng: "Check-in: 3 p.m." (11 giờ là giờ trả phòng — dễ nhầm).',
          'check in (v) — nhận phòng',
          'Trung cấp',
        ),
      ),
      mc(
        'Because of the roadworks, what should travellers expect?',
        ['The airport shuttle may run about ten minutes late', 'The highway will close completely', 'The inn will cancel the shuttle', 'Check-in will be delayed until noon'],
        0,
        note(
          'Thông báo: "The hourly airport shuttle will use the inland route and may arrive ten minutes late" — đường chỉ giảm một làn, không đóng.',
          'delay (n) — sự trễ',
          'Trung cấp',
        ),
      ),
      mc(
        'Why does the notice recommend the 6 a.m. shuttle?',
        ['So travellers reach morning flights despite possible delays', 'Because the shuttle stops running after 6 a.m.', 'Because the inn checks out at six', 'Because flights only leave in the morning'],
        0,
        note(
          'Suy luận: kẹt xe tới 30 phút + shuttle trễ ~10 phút → đi chuyến 6 giờ để còn dư thời gian cho chuyến bay sáng.',
          'shuttle (n) — xe buýt đưa đón',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 7 — Triple Text 3: Article + Advertisement + Notice (Riverside Festival)',
    kind: 'triple',
    texts: [
      `RIVERSIDE FESTIVAL RETURNS NEXT MONTH

The Riverside Festival returns on June 21 for its eighth year. Organisers expect 20,000 visitors over the weekend, up from 14,000 last year.

New this year is a makers' market with 60 local craft stalls, plus a stage for school bands on Sunday morning. Food trucks will line the west path.

Last year's event produced six tons of waste, so this year every vendor must use compostable containers. Volunteers will staff recycling points at every entrance.`,
      `FESTIVAL VISITORS — PARK WITH US

Riverside Garage, two minutes from the west gate.
Weekend rate: $8 flat, payable by app or at the barrier.
Open 7 a.m. to midnight.
Reserve a space online and your ticket is scanned automatically — no queue.`,
      `NOTICE FOR VENDORS

Because of the larger crowd, all vendor vehicles must arrive before 8 a.m. on June 21. After that time, Gate 3 will be closed to traffic until 6 p.m.

Vehicles may park behind the food-truck zone until the gate closes. Compostable containers must be shown at the check-in desk before setup.`,
    ],
    questions: [
      mc(
        'How many visitors are expected at this year’s festival?',
        ['Eight thousand', 'Fourteen thousand', 'Twenty thousand', 'Sixty thousand'],
        2,
        note(
          '"expect 20,000 visitors … up from 14,000 last year" — 14.000 là con số năm ngoái, 60 là số gian hàng.',
          'visitor (n) — du khách, người tham dự',
          'Dễ',
        ),
      ),
      mc(
        'What must vendors do differently this year?',
        ['Use compostable containers', 'Pay an $8 parking fee', 'Arrive before 6 p.m.', 'Staff the recycling points'],
        0,
        note(
          'Do năm ngoái thải ra sáu tấn rác, năm nay "every vendor must use compostable containers" —容器 hữu cơ phân hủy.',
          'compostable (adj) — có thể ủ phân hủy',
          'Trung cấp',
        ),
      ),
      mc(
        'How much does parking at Riverside Garage cost for the weekend?',
        ['$8', '$20', '$14', '$6'],
        0,
        note(
          '"Weekend rate: $8 flat" — giá cố định, thanh toán qua app hoặc ở barrier.',
          'flat rate (n) — giá cố định',
          'Dễ',
        ),
      ),
      mc(
        'What must vendor vehicles do on June 21?',
        ['Arrive before 8 a.m.', 'Park at Riverside Garage', 'Enter through Gate 3 after noon', 'Show a weekend ticket'],
        0,
        note(
          'Thông báo cho nhà cung cấp: "all vendor vehicles must arrive before 8 a.m." — sau đó Gate 3 chặn xe tới 18 giờ.',
          'vendor (n) — nhà cung cấp, người bán',
          'Trung cấp',
        ),
      ),
      mc(
        'What happens to Gate 3 after 8 a.m.?',
        ['It is closed to traffic until 6 p.m.', 'It becomes the only entrance for visitors', 'It is reserved for food trucks', 'It opens for online reservations'],
        0,
        note(
          '"After that time, Gate 3 will be closed to traffic until 6 p.m." — cổng 3 không cho xe qua trong khung 8–18 giờ.',
          'gate (n) — cổng ra vào',
          'Trung cấp',
        ),
      ),
      mc(
        'What is the festival trying to reduce this year?',
        ['The amount of waste sent to landfills', 'The number of visitors', 'The price of parking', 'The number of food stalls'],
        0,
        note(
          'Bài báo nêu năm ngoái sáu tấn rác → năm nay bắt buộc container phân hủy và bố trí điểm tái chế.',
          'waste (n) — rác thải',
          'Trung cấp',
        ),
      ),
    ],
  },
];

export const PART7_COUNT = 12;
