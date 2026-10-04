/**
 * seed-content/ielts/listening.ts — IELTS Academic Listening (4 sections x 10 = 40).
 *
 * Real IELTS task types are preserved and mapped onto FE-answerable question
 * types (see seed-content/types.ts):
 *   Section 1  form completion            -> FILL_BLANK   (answerText)
 *   Section 2  map labelling + table      -> MC (5) + FILL_BLANK (5)
 *   Section 3  conversation + matching    -> MULTIPLE_CHOICE (10)
 *   Section 4  lecture + notes + summary  -> MC (6) + FILL_BLANK (4)
 *
 * Each section shares ONE audio placeholder material carrying the full
 * transcript ("Xem transcript" in the FE).
 */
import { SeedGroup, SeedQuestion, mc, note, openTask } from '../types';
import { expectCount } from '../validate';

/* ------------------------- Section 1 (Q1-10) ------------------------- */

const S1_TRANSCRIPT = `M: Good morning, Riverside Property Rentals. How can I help you?
W: Good morning. I am looking for a flat to move into next month. My name is Anna Marlow.
M: Thank you, Ms. Marlow. Could you tell me how many people will be moving in?
W: There are four of us — my husband, our two children and me.
M: And which area do you prefer?
W: We would like to stay near the river, ideally in Riverside, because the children's school is there.
M: What sort of property are you looking for?
W: A flat rather than a house. Three bedrooms would be ideal, but two is fine.
M: When would you like to move in?
W: On the twenty-sixth of August, if possible.
M: Do you have a budget for the rent?
W: We can pay up to eight hundred and fifty pounds a month.
M: That is fine. We normally ask for a deposit equal to one month's rent.
W: That is no problem. Is the flat furnished?
M: Yes, partly furnished — there are beds and a washing machine, but no sofa.
W: Good. How far is it from public transport?
M: There is a bus stop right outside the building.
W: And when could we view it? We work during the week.
M: The office is open on weekdays, but we also arrange viewings on Saturday morning.
W: Saturday would be perfect. Thank you very much.`;

const S1_QUESTIONS: SeedQuestion[] = [
  openTask(
    'FILL_BLANK',
    'What is the caller\'s family name?',
    note(
      'Mở đầu cuộc gọi: "My name is Anna Marlow." — họ là Marlow (chấp nhận Marlow/Ms Marlow).',
      'caller (n) — người gọi điện',
      'Dễ',
    ),
    ['Marlow', 'Ms Marlow'],
  ),
  openTask(
    'FILL_BLANK',
    'How many people are moving into the flat?',
    note(
      '"There are four of us — my husband, our two children and me." → four / 4 người.',
      'move in (v) — dọn vào ở',
      'Dễ',
    ),
    ['four', '4'],
  ),
  openTask(
    'FILL_BLANK',
    'Which area does the family prefer to live in?',
    note(
      '"stay near the river, ideally in Riverside" — khu vực ưu tiên là Riverside (bên cạnh "near the river").',
      'area (n) — khu vực',
      'Dễ',
    ),
    ['Riverside'],
  ),
  openTask(
    'FILL_BLANK',
    'What type of property does the family want?',
    note(
      '"A flat rather than a house." → flat / apartment (không phải house).',
      'property (n) — bất động sản, nhà ở',
      'Dễ',
    ),
    ['flat', 'apartment'],
  ),
  openTask(
    'FILL_BLANK',
    'When does the family want to move in?',
    note(
      '"On the twenty-sixth of August" → 26 August / August 26 (chấp nhận cả hai dạng ghi ngày).',
      'move-in date (n) — ngày dọn vào',
      'Dễ',
    ),
    ['26 August', 'August 26'],
  ),
  openTask(
    'FILL_BLANK',
    'What is the maximum monthly rent the family can pay?',
    note(
      '"up to eight hundred and fifty pounds a month" → 850 (pounds).',
      'rent (n) — tiền thuê',
      'Dễ',
    ),
    ['850', '£850'],
  ),
  openTask(
    'FILL_BLANK',
    'The deposit equals how many months of rent?',
    note(
      '"a deposit equal to one month\'s rent" → one / 1 tháng tiền cọc.',
      'deposit (n) — tiền đặt cọc',
      'Dễ',
    ),
    ['one', '1', 'one month', '1 month'],
  ),
  openTask(
    'FILL_BLANK',
    'How would you describe the furniture in the flat?',
    note(
      '"partly furnished — beds and a washing machine, but no sofa" → partly furnished (đầy đủ một phần).',
      'furnished (adj) — có sẵn nội thất',
      'Trung cấp',
    ),
    ['partly furnished', 'partly-furnished'],
  ),
  openTask(
    'FILL_BLANK',
    'What public transport is right outside the building?',
    note(
      '"There is a bus stop right outside the building" → bus stop.',
      'bus stop (n) — điểm dừng xe buýt',
      'Dễ',
    ),
    ['bus stop', 'a bus stop'],
  ),
  openTask(
    'FILL_BLANK',
    'On which day can the family view the flat?',
    note(
      'Cuối thoại: "we also arrange viewings on Saturday morning" → Saturday (vì hai người đi làm trong tuần).',
      'viewing (n) — buổi xem nhà',
      'Dễ',
    ),
    ['Saturday', 'Saturday morning'],
  ),
];

/* ------------------------- Section 2 (Q11-20) ------------------------ */

const S2_TRANSCRIPT = `Speaker: Welcome to Greenfield Country Park. Here is some information before you start your visit.
Speaker: The reception desk is just inside the main gate, on your right — not opposite the gate, as it was last year.
Speaker: The adventure playground is beside the car park, so families can reach it within a minute of arriving.
Speaker: If you would like to hire a bicycle, the cycle centre is behind the café, near the lake.
Speaker: The lake is in the middle of the park, and the rowing boats leave from the eastern shore.
Speaker: The picnic area is next to the river, downstream from the old bridge.
Speaker: Now, some practical details. The park museum opens at ten o'clock in the morning and closes at half past five.
Speaker: Guided tours of the Victorian house cost six pounds for adults, and children under five go free.
Speaker: Parking at the park costs three pounds for the whole day.
Speaker: Bicycles can be hired for four pounds a day, and helmets are provided free of charge.
Speaker: The café serves lunch until three o'clock, and fresh bread is baked on the premises every morning.
Speaker: Thank you, and enjoy your day at Greenfield.`;

const S2_QUESTIONS: SeedQuestion[] = [
  mc(
    'Where is the reception desk in the park?',
    [
      'Opposite the main gate',
      'Just inside the main gate, on the right',
      'Behind the café, near the lake',
      'Beside the car park',
    ],
    1,
    note(
      '"just inside the main gate, on your right — not opposite the gate" — C là bẫy của năm ngoái, đáp án đúng là trong cổng bên phải.',
      'reception desk (n) — quầy lễ tân',
      'Trung cấp',
    ),
  ),
  mc(
    'Where is the adventure playground?',
    [
      'Behind the café',
      'Downstream from the bridge',
      'Beside the car park',
      'On the eastern shore of the lake',
    ],
    2,
    note(
      '"The adventure playground is beside the car park" — ngay cạnh bãi đỗ xe để gia đình đến nhanh.',
      'playground (n) — khu vui chơi',
      'Dễ',
    ),
  ),
  mc(
    'Where can visitors hire bicycles?',
    [
      'At the cycle centre behind the café, near the lake',
      'At the reception desk inside the gate',
      'Next to the old bridge',
      'At the museum entrance',
    ],
    0,
    note(
      '"the cycle centre is behind the café, near the lake" — trung tâm thuê xe đạp nằm sau quán cà phê.',
      'hire (v) — thuê',
      'Dễ',
    ),
  ),
  mc(
    'Where do the rowing boats leave from?',
    [
      'The western shore of the lake',
      'The river downstream from the bridge',
      'The main gate',
      'The eastern shore of the lake',
    ],
    3,
    note(
      '"the rowing boats leave from the eastern shore" — bờ ĐÔNG của hồ, khác "west" và khác sông.',
      'rowing boat (n) — thuyền chèo',
      'Trung cấp',
    ),
  ),
  mc(
    'Where is the picnic area?',
    [
      'Beside the car park',
      'Next to the river, downstream from the old bridge',
      'On the eastern shore of the lake',
      'Just inside the main gate',
    ],
    1,
    note(
      '"The picnic area is next to the river, downstream from the old bridge" — ven sông, hạ nguồn so với cây cầu cũ.',
      'picnic area (n) — khu dã ngoại',
      'Trung cấp',
    ),
  ),
  openTask(
    'FILL_BLANK',
    'At what time does the park museum open?',
    note(
      '"The park museum opens at ten o\'clock in the morning" → ten / 10 o\'clock (10:00 am).',
      'open (v) — mở cửa',
      'Dễ',
    ),
    ['ten', '10', '10 o\'clock', '10:00'],
  ),
  openTask(
    'FILL_BLANK',
    'How much does an adult guided tour of the Victorian house cost?',
    note(
      '"Guided tours … cost six pounds for adults" → six / £6.',
      'guided tour (n) — chuyến tham quan có hướng dẫn',
      'Dễ',
    ),
    ['six', '6', '£6'],
  ),
  openTask(
    'FILL_BLANK',
    'Children under what age go free on guided tours?',
    note(
      '"children under five go free" → under five / 5 tuổi.',
      'go free — được miễn phí',
      'Dễ',
    ),
    ['five', '5'],
  ),
  openTask(
    'FILL_BLANK',
    'How much does parking at the park cost for the whole day?',
    note(
      '"Parking at the park costs three pounds for the whole day" → three / £3.',
      'parking (n) — chỗ đậu xe',
      'Dễ',
    ),
    ['three', '3', '£3'],
  ),
  openTask(
    'FILL_BLANK',
    'How much does it cost to hire a bicycle for one day?',
    note(
      '"Bicycles can be hired for four pounds a day" → four / £4 mỗi ngày.',
      'bicycle hire — thuê xe đạp',
      'Dễ',
    ),
    ['four', '4', '£4'],
  ),
];

/* ------------------------- Section 3 (Q21-30) ------------------------ */

const S3_TRANSCRIPT = `TUTOR: So, Maya, Tom — how is your project on music and concentration going?
MAYA: We finished the experiments last week. We tested twenty students in the library.
TOM: Each student read the same article for twenty minutes — first in silence, and then with instrumental music.
TUTOR: And what did you find?
MAYA: Concentration was actually lower with music. The average reading speed fell by about twelve percent.
TOM: But the students said they preferred working with music, even though they were slower.
TUTOR: Interesting. How did you measure concentration? Reading speed alone is not enough.
MAYA: We also counted the number of times each student looked out of the window.
TUTOR: Good — that is a useful second measure. And who designed the questionnaire?
TOM: Dr Reed helped us with that. She gave us her standard set of questions.
TUTOR: Right. Now, your sample is quite small — only twenty people. What will you do about it?
MAYA: We will repeat the test with another class next month, so we will have sixty participants in total.
TUTOR: Excellent. And for the presentation in week ten?
TOM: We will show two graphs — one for reading speed and one for the number of breaks.
TUTOR: Make sure you explain the difference between preference and performance clearly.
MAYA: We will. The slides are already half finished.
TUTOR: One last thing: send me the draft by Friday at five, not the following Monday.
TOM: Friday at five — we will e-mail it to you.`;

const S3_QUESTIONS: SeedQuestion[] = [
  mc(
    'What was the main result of the experiment on music and concentration?',
    [
      'Students read faster when music was playing.',
      'There was no difference between the two conditions.',
      'Students read more slowly when music was playing.',
      'Music improved concentration but reduced preference.',
    ],
    2,
    note(
      '"Concentration was actually lower with music — the average reading speed fell by about twelve percent" → đọc CHẬM hơn 12%.',
      'reading speed (n) — tốc độ đọc',
      'Trung cấp',
    ),
  ),
  mc(
    'What aspect of the results surprised the students most?',
    [
      'Students still preferred music even though they performed worse.',
      'Silence produced the slowest reading speeds.',
      'Only one student disliked music.',
      'Instrumental music was faster than vocal music.',
    ],
    0,
    note(
      '"they preferred working with music, even though they were slower" — thích (preference) đi ngược với kết quả (performance), chính là bất ngờ.',
      'prefer (v) — thích hơn',
      'Trung cấp',
    ),
  ),
  mc(
    'What second measure of concentration did the tutor approve?',
    [
      'The number of correct answers in a quiz',
      'The number of times students looked out of the window',
      'The heart rate of each student',
      'The length of each break',
    ],
    1,
    note(
      'Maya: "We also counted the number of times each student looked out of the window" và tutor gọi đó là "a useful second measure".',
      'measure (n) — thước đo',
      'Trung cấp',
    ),
  ),
  mc(
    'Who helped the students design the questionnaire?',
    [
      'Dr Reed',
      'Maya',
      'The librarian',
      'The tutor himself',
    ],
    0,
    note(
      '"Dr Reed helped us with that. She gave us her standard set of questions." — người thiết kế là Dr Reed.',
      'questionnaire (n) — bảng hỏi',
      'Dễ',
    ),
  ),
  mc(
    'Why was the tutor concerned about the participants?',
    [
      'They were all from the same music class.',
      'They were too young to read the article.',
      'They were tested in silence only.',
      'The sample was too small.',
    ],
    3,
    note(
      '"your sample is quite small — only twenty people" → lo ngại về cỡ mẫu 20 người.',
      'sample (n) — mẫu khảo sát',
      'Dễ',
    ),
  ),
  mc(
    'What will the students do next month?',
    [
      'Repeat the test with another class',
      'Write the final report',
      'Present the results to the faculty',
      'Interview Dr Reed',
    ],
    0,
    note(
      '"We will repeat the test with another class next month" — chạy lại thí nghiệm với lớp khác.',
      'repeat (v) — lặp lại',
      'Dễ',
    ),
  ),
  mc(
    'How many participants do the students want in total?',
    ['Twenty', 'Forty', 'Sixty', 'Eighty'],
    2,
    note(
      '"so we will have sixty participants in total" — 20 cũ + lớp mới = 60 người.',
      'participant (n) — người tham gia',
      'Dễ',
    ),
  ),
  mc(
    'What will the students show during the presentation?',
    [
      'A video of the library session',
      'Two graphs — reading speed and number of breaks',
      'The questionnaire designed by Dr Reed',
      'Interviews with the participants',
    ],
    1,
    note(
      '"We will show two graphs — one for reading speed and one for the number of breaks."',
      'presentation (n) — bài thuyết trình',
      'Dễ',
    ),
  ),
  mc(
    'What point must the students explain clearly in week ten?',
    [
      'The difference between preference and performance',
      'The cost of the project',
      'How to design a questionnaire',
      'Why the library was chosen',
    ],
    0,
    note(
      '"Make sure you explain the difference between preference and performance clearly" — yêu cầu cuối của tutor.',
      'performance (n) — hiệu suất',
      'Khó',
    ),
  ),
  mc(
    'When must the students send the draft to the tutor?',
    [
      'Monday at five',
      'Friday at five',
      'Sunday at midnight',
      'Week ten before class',
    ],
    1,
    note(
      '"send me the draft by Friday at five, not the following Monday" — hạn chót là 17 giờ thứ Sáu.',
      'draft (n) — bản nháp',
      'Trung cấp',
    ),
  ),
];

/* ------------------------- Section 4 (Q31-40) ------------------------ */

const S4_TRANSCRIPT = `Speaker: Good morning. Today we look at one of the most cited examples of wildlife recovery: the return of the grey wolf to Yellowstone National Park.
Speaker: Wolves were exterminated in Yellowstone by 1926. The last pack was shot near the northern boundary of the park.
Speaker: For seventy years the elk population grew without control, and young willow and aspen trees were eaten almost as soon as they appeared.
Speaker: The wolves were reintroduced in 1995. Fourteen animals were captured in Canada and released in the northern range of the park.
Speaker: Within a few years the number of elk fell, but just as importantly the elk changed their behaviour: they avoided open valleys where they could not watch for predators.
Speaker: Ecologists call this the landscape of fear. It shows that behaviour, not just numbers, reshapes a whole park.
Speaker: Willow and aspen recovered along the riverbanks. Beavers then returned to the new willow stands and built dams that raised the water table.
Speaker: The wetter ground supported more fish, birds and insects, so the recovery spread far beyond the trees themselves.
Speaker: The lesson for restoration ecologists is striking. You do not always need to plant trees. Sometimes you only need to remove the pressure that was stopping them from growing.
Speaker: Next week we will compare this case with the recovery of sea otters along the Pacific coast.`;

const S4_QUESTIONS: SeedQuestion[] = [
  mc(
    'According to the lecture, when were wolves exterminated from Yellowstone?',
    ['By 1926', 'In 1995', 'Seventy years ago', 'After the last survey'],
    0,
    note(
      '"Wolves were exterminated in Yellowstone by 1926" — mốc thời gian tường minh trong bài.',
      'exterminate (v) — tiêu diệt, diệt trừ',
      'Trung cấp',
    ),
  ),
  mc(
    'Where were the wolves reintroduced in 1995 captured?',
    ['In Canada', 'In the southern range', 'In Yellowstone itself', 'In a nearby farm'],
    0,
    note(
      '"Fourteen animals were captured in Canada and released in the northern range" — bắt từ Canada.',
      'capture (v) — bắt',
      'Dễ',
    ),
  ),
  mc(
    'What does the term "landscape of fear" describe?',
    [
      'The physical shape of the valleys in Yellowstone',
      'Elk avoiding open areas because of predators',
      'The damage caused by seventy years of drought',
      'The tourist routes inside the park',
    ],
    1,
    note(
      'Bài giảng: elk "avoided open valleys where they could not watch for predators" → THAY VỀ HÀNH VI trốn kẻ săn mồi, không phải địa hình.',
      'predator (n) — kẻ săn mồi',
      'Khó',
    ),
  ),
  mc(
    'What returned to the recovered willow stands along the riverbanks?',
    ['Beavers', 'Wolves', 'Tourists', 'Elk herds'],
    0,
    note(
      '"Beavers then returned to the new willow stands and built dams" — hải ly quay lại nhờ có liễu mọc lại.',
      'beaver (n) — hải ly',
      'Dễ',
    ),
  ),
  mc(
    'How did the beavers change the wetland environment?',
    [
      'They dug channels that cooled the water',
      'They planted new willow trees',
      'They built dams that raised the water table',
      'They removed predators from the valley',
    ],
    2,
    note(
      '"built dams that raised the water table" — đập của hải ly nâng mực nước ngầm, làm ướt đất.',
      'water table (n) — mực nước ngầm',
      'Khó',
    ),
  ),
  mc(
    'What is the main lesson of the lecture for restoration ecologists?',
    [
      'Wolves should be reintroduced into every national park.',
      'Planting trees is the only reliable restoration method.',
      'Elk populations must be hunted to protect vegetation.',
      'Sometimes removing a pressure is enough to let an ecosystem recover.',
    ],
    3,
    note(
      'Ý chính kết bài: "You do not always need to plant trees. Sometimes you only need to remove the pressure…" → khôi phục hệ sinh thái bằng cách gỡ áp lực.',
      'restoration (n) — phục hồi',
      'Khó',
    ),
  ),
  openTask(
    'FILL_BLANK',
    'In the lecture, the speaker says the last Yellowstone wolf pack was shot near the ______ boundary of the park.',
    note(
      '"The last pack was shot near the northern boundary of the park" → northern (biên giới PHÍA BẮC).',
      'boundary (n) — ranh giới',
      'Trung cấp',
    ),
    ['northern'],
  ),
  openTask(
    'FILL_BLANK',
    'For how many years did the elk population grow without control after the wolves disappeared?',
    note(
      '"For seventy years the elk population grew without control" → seventy / 70 năm.',
      'without control — không có sự kiểm soát',
      'Dễ',
    ),
    ['seventy', '70'],
  ),
  openTask(
    'FILL_BLANK',
    'Ecologists call the behaviour change of the elk the landscape of ______.',
    note(
      '"Ecologists call this the landscape of fear" → fear (bức tranh sợ hãi — hươu né vùng trống).',
      'landscape (n) — phong cảnh, bức tranh',
      'Trung cấp',
    ),
    ['fear'],
  ),
  openTask(
    'FILL_BLANK',
    'The dams built by beavers raised the water ______ of the surrounding ground.',
    note(
      '"built dams that raised the water table" → table (mực nước ngầm, KHÔNG phải "water level").',
      'dam (n) — đập',
      'Khó',
    ),
    ['table'],
  ),
];

/* ------------------------------ groups ------------------------------- */

expectCount('IELTS Listening S1 questions', S1_QUESTIONS.length, 10);
expectCount('IELTS Listening S2 questions', S2_QUESTIONS.length, 10);
expectCount('IELTS Listening S3 questions', S3_QUESTIONS.length, 10);
expectCount('IELTS Listening S4 questions', S4_QUESTIONS.length, 10);

export const IELTS_LISTENING: SeedGroup[] = [
  {
    title: 'Listening Section 1 - Accommodation enquiry (form completion)',
    groupType: 'AUDIO',
    instructions:
      'Nghe cuộc gọi hỏi thuê nhà và điền vào biểu mẫu (10 chỗ trống). Nghe tối đa 2 lần. Mỗi câu là MỘT từ hoặc cụm từ ngắn.',
    materials: [
      { type: 'AUDIO', title: 'Listening Section 1 - Accommodation enquiry', fileUrl: '/audio/ielts/listening-s1.mp3', transcript: S1_TRANSCRIPT },
    ],
    questions: S1_QUESTIONS,
  },
  {
    title: 'Listening Section 2 - Country park visitor information (map + table)',
    groupType: 'IMAGE',
    instructions:
      'Nghe hướng dẫn cho khách tham quan công viên. Câu 11-15: chọn vị trí trên bản đồ (A-D). Câu 16-20: điền thông tin vào bảng.',
    materials: [
      { type: 'IMAGE', title: 'Sơ đồ công viên Greenfield', fileUrl: '/images/ielts/listening-s2-map.jpg' },
      { type: 'AUDIO', title: 'Listening Section 2 - Visitor information', fileUrl: '/audio/ielts/listening-s2.mp3', transcript: S2_TRANSCRIPT },
    ],
    questions: S2_QUESTIONS,
  },
  {
    title: 'Listening Section 3 - Student discussion with tutor (matching + MCQ)',
    groupType: 'AUDIO',
    instructions:
      'Nghe cuộc trao đổi giữa 2 sinh viên và giảng viên về dự án tâm lý học. Trả lời 10 câu trắc nghiệm (4 phương án).',
    materials: [
      { type: 'AUDIO', title: 'Listening Section 3 - Project discussion', fileUrl: '/audio/ielts/listening-s3.mp3', transcript: S3_TRANSCRIPT },
    ],
    questions: S3_QUESTIONS,
  },
  {
    title: 'Listening Section 4 - Lecture: wolves and ecosystem recovery (notes + summary)',
    groupType: 'AUDIO',
    instructions:
      'Nghe bài giảng học thuật về sự hồi phục của sói xám Yellowstone. Câu 31-36: trắc nghiệm. Câu 37-40: hoàn thành bản ghi chú/tóm tắt.',
    materials: [
      { type: 'AUDIO', title: 'Listening Section 4 - Academic lecture', fileUrl: '/audio/ielts/listening-s4.mp3', transcript: S4_TRANSCRIPT },
    ],
    questions: S4_QUESTIONS,
  },
];
