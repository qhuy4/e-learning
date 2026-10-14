import { LISTENING_SECTIONS } from "../constants";
import type { IeltsQuestion, ListeningSectionConfig, ListeningStimulus, QuestionType } from "../types";

/**
 * Listening mock data — 4 sections × 10 questions (40 total), covering every
 * official IELTS listening question type. UI-only demo content (English).
 */

export interface ListeningSectionData {
  config: ListeningSectionConfig;
  stimulus: ListeningStimulus;
  questions: IeltsQuestion[];
}

interface Seed {
  num: number;
  type: QuestionType;
  stem: string;
  instruction?: string;
  options?: string[];
  correct: string;
  explanation: string;
  vocab?: string[];
  transcript?: string;
}

function instructionFor(seed: Seed): string {
  if (seed.instruction) return seed.instruction;
  switch (seed.type) {
    case "multiple-choice":
    case "matching-information":
      return "Choose the correct letter, A–D.";
    case "multiple-selection":
      return "Choose the correct letters, A–E. Choose TWO answers.";
    case "map-labeling":
    case "diagram-labeling":
      return "Select your answer from the list.";
    default:
      return "Write NO MORE THAN TWO WORDS AND/OR A NUMBER.";
  }
}

function build(section: 1 | 2 | 3 | 4, seeds: Seed[]): IeltsQuestion[] {
  return seeds.map((seed) => ({
    id: seed.num,
    num: seed.num,
    module: "listening" as const,
    type: seed.type,
    group: section,
    instruction: instructionFor(seed),
    stem: seed.stem,
    options: seed.options,
    correct: seed.correct,
    explanation: seed.explanation,
    vocab: seed.vocab,
    transcript: seed.transcript,
  }));
}

/* ------------------------------------------------------------------ *
 * Section 1 — Form Completion (1–10)
 * ------------------------------------------------------------------ */

const SECTION1_STIMULUS: ListeningStimulus = {
  section: 1,
  kind: "form",
  title: "Questions 1–6 · Harbour View Apartments",
  instruction:
    "You will hear a woman calling about a flat to rent. Complete the booking form. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
  body: [
    "HARBOUR VIEW APARTMENTS — ACCOMMODATION BOOKING",
    "Family name: Okonkwo",
    "First name: {{1}}",
    "Address: 14 Bramley Road, Kentish Town, London",
    "Postcode: {{2}}",
    "Type of room: single / twin / {{3}}",
    "Length of stay: {{4}} weeks",
    "Arrival date: 12 March",
    "Special requirement: {{5}} (ground floor)",
    "Contact number: {{6}}",
  ],
  audioDurationSec: 96,
};

const SECTION1: Seed[] = [
  {
    num: 1,
    type: "note-completion",
    stem: "First name",
    correct: "Nadia",
    explanation: "Nghe rõ phần giới thiệu: “My daughter’s name is Nadia” — chỉ cần điền một từ.",
    vocab: ["tenant (n): người thuê nhà"],
    transcript: "Receptionist: And the first name, please? — Caller: Nadia. N-A-D-I-A.",
  },
  {
    num: 2,
    type: "note-completion",
    stem: "Postcode",
    instruction: "Write NO MORE THAN ONE WORD AND/OR A NUMBER.",
    correct: "NW5 3RT/NW53RT",
    explanation: "Postcode đọc theo từng ký tự: N-W-5-3-R-T. Cả hai cách viết đều đúng.",
    vocab: ["postcode (n): mã bưu chính"],
    transcript: "Caller: The postcode is N-W-5, 3-R-T.",
  },
  {
    num: 3,
    type: "note-completion",
    stem: "Type of room (single / twin / ______)",
    correct: "double",
    explanation: "“We’d prefer a double room” — đôi với hai người nên chọn double, không phải twin.",
    vocab: ["twin room: phòng hai giường đơn"],
    transcript: "Caller: Not the single, and not a twin — a double room would be best.",
  },
  {
    num: 4,
    type: "note-completion",
    stem: "Length of stay — ______ weeks",
    instruction: "Write ONE WORD AND/OR A NUMBER.",
    correct: "6",
    explanation: "“Six weeks, from the twelfth of March” — đáp án là con số 6.",
    transcript: "Caller: We’ll be staying six weeks in total.",
  },
  {
    num: 5,
    type: "note-completion",
    stem: "Special requirement — ______ (ground floor)",
    correct: "wheelchair access",
    explanation: "Yêu cầu đặc biệt là lối vào cho xe lăn ở tầng trệt.",
    vocab: ["wheelchair access: lối đi cho xe lăn"],
    transcript: "Caller: My father uses a wheelchair, so we need wheelchair access.",
  },
  {
    num: 6,
    type: "note-completion",
    stem: "Contact number",
    instruction: "Write NO MORE THAN THREE NUMBERS.",
    correct: "07700 900412",
    explanation: "Số điện thoại di đọc nối tiếp; chấp nhận cả khi bỏ khoảng trắng.",
    transcript: "Caller: The best number is 07700 900412.",
  },
  {
    num: 7,
    type: "multiple-choice",
    stem: "How much is the deposit for each tenant?",
    options: ["£150", "£250", "£350", "£500"],
    correct: "B",
    explanation: "“The deposit is two hundred and fifty pounds each” → £250.",
    vocab: ["deposit (n): tiền đặt cọc"],
    transcript: "Agent: It’s two hundred and fifty pounds each, refundable at the end.",
  },
  {
    num: 8,
    type: "multiple-choice",
    stem: "What time must residents be quiet after?",
    options: ["8:00 pm", "9:00 pm", "10:00 pm", "11:00 pm"],
    correct: "C",
    explanation: "Quiet hours bắt đầu từ 10 giờ tối — nghe nhầm “from 10” thành “until 10”.",
    transcript: "Agent: Please keep noise down after ten in the evening.",
  },
  {
    num: 9,
    type: "multiple-choice",
    stem: "Which facility is NOT included in the rent?",
    options: ["Electricity", "Internet", "Laundry", "Water"],
    correct: "C",
    explanation: "“Everything is included except the laundry” — máy giặt tính riêng.",
    vocab: ["laundry (n): dịch vụ giặt ủi"],
    transcript: "Agent: Water, electricity and internet are all included — only the laundry is extra.",
  },
  {
    num: 10,
    type: "multiple-choice",
    stem: "What must tenants do before moving out?",
    options: [
      "Give two weeks’ notice in writing",
      "Clean all the windows",
      "Attend a leaving meeting",
      "Repaint their own room",
    ],
    correct: "A",
    explanation: "Thông báo trước 2 tuần bằng văn bản.",
    vocab: ["give notice: báo trước (khi chấm dứt hợp đồng)"],
    transcript: "Agent: We just need two weeks’ notice in writing before you leave.",
  },
];

/* ------------------------------------------------------------------ *
 * Section 2 — Map / Diagram Labeling (11–20)
 * ------------------------------------------------------------------ */

const SECTION2_STIMULUS: ListeningStimulus = {
  section: 2,
  kind: "map",
  title: "Questions 11–14 · Riverside Country Park",
  instruction:
    "You will hear a guide introducing Riverside Country Park. Label the map. Select the correct location from the list for questions 11–14.",
  body: [
    "RIVERSIDE COUNTRY PARK — VISITOR MAP",
    "Main gate → visitor centre → riverside path",
    "Locations 11–14 are marked on the map.",
    "Locations 15–17 belong to the solar water heater diagram below.",
  ],
  figureCaption: "Map of Riverside Country Park (demo placeholder)",
  audioDurationSec: 108,
};

const MAP_OPTIONS = [
  "visitor centre",
  "boat hire centre",
  "picnic area",
  "petting farm",
  "refreshment kiosk",
  "main gate",
  "woodland trail",
  "adventure playground",
];

const DIAGRAM_OPTIONS = [
  "cold water inlet",
  "solar collector panel",
  "insulated tank",
  "hot water outlet",
  "pressure relief valve",
  "control panel",
];

const SECTION2: Seed[] = [
  {
    num: 11,
    type: "map-labeling",
    stem: "Location 11 on the map",
    options: MAP_OPTIONS,
    correct: "boat hire centre",
    explanation: "Đi qua cây cầu đầu tiên, ngay bên phải — boat hire centre.",
    vocab: ["hire (v): cho thuê"],
    transcript: "Guide: Cross the first bridge and you’ll find the boat hire centre on your right.",
  },
  {
    num: 12,
    type: "map-labeling",
    stem: "Location 12 on the map",
    options: MAP_OPTIONS,
    correct: "picnic area",
    explanation: "Picnic area nằm ngay sau visitor centre, cạnh bãi cỏ lớn.",
    transcript: "Guide: Directly behind the visitor centre is the big picnic area.",
  },
  {
    num: 13,
    type: "map-labeling",
    stem: "Location 13 on the map",
    options: MAP_OPTIONS,
    correct: "petting farm",
    explanation: "Cuối con đường mòn về phía tây nam là petting farm.",
    vocab: ["petting farm: nông trại cho trẻ nuôi động vật"],
    transcript: "Guide: Follow the woodland trail south-west and you’ll reach the petting farm.",
  },
  {
    num: 14,
    type: "map-labeling",
    stem: "Location 14 on the map",
    options: MAP_OPTIONS,
    correct: "refreshment kiosk",
    explanation: "Kiosk nằm bên trái lối vào, gần main gate.",
    transcript: "Guide: As you come in, there’s a small refreshment kiosk just to the left.",
  },
  {
    num: 15,
    type: "diagram-labeling",
    stem: "Part 15 of the solar water heater diagram",
    options: DIAGRAM_OPTIONS,
    correct: "solar collector panel",
    explanation: "Mặt phẳng lớn hấp thu nhiệt ở trên cùng là collector panel.",
    vocab: ["collector (n): bộ thu (nhiệt)"],
    transcript: "Lecturer: The flat panel on the roof is the solar collector — it absorbs the heat.",
  },
  {
    num: 16,
    type: "diagram-labeling",
    stem: "Part 16 of the solar water heater diagram",
    options: DIAGRAM_OPTIONS,
    correct: "insulated tank",
    explanation: "Bồn nước được cách nhiệt ở phía dưới bên trái.",
    transcript: "Lecturer: Water rises into the insulated tank at the top left.",
  },
  {
    num: 17,
    type: "diagram-labeling",
    stem: "Part 17 of the solar water heater diagram",
    options: DIAGRAM_OPTIONS,
    correct: "hot water outlet",
    explanation: "Ống ra dẫn nước nóng xuống phía dưới bên phải.",
    transcript: "Lecturer: And the pipe on the lower right is the hot water outlet.",
  },
  {
    num: 18,
    type: "multiple-choice",
    stem: "What does the guide say about parking?",
    options: [
      "It is free at weekends only",
      "It is free all week",
      "It costs £2 per visit",
      "It is closed in winter",
    ],
    correct: "B",
    explanation: "“Parking is free all year round” — không mất phí quanh năm.",
    transcript: "Guide: Parking is completely free — all year round, not just at weekends.",
  },
  {
    num: 19,
    type: "multiple-choice",
    stem: "Which activity must be booked in advance?",
    options: ["The cycling route", "The boat trip", "The guided walk", "The farm visit"],
    correct: "B",
    explanation: "Chỉ thuyền là phải đặt trước; các hoạt động còn lại tự do.",
    vocab: ["in advance: trước (thời điểm)"],
    transcript: "Guide: Everything is drop-in except the boat trip — that one needs booking ahead.",
  },
  {
    num: 20,
    type: "multiple-choice",
    stem: "What time does the park close today?",
    options: ["4:30 pm", "5:00 pm", "5:30 pm", "6:00 pm"],
    correct: "C",
    explanation: "“We close at half past five” = 5:30 pm.",
    transcript: "Guide: In summer we stay open until half past five.",
  },
];

/* ------------------------------------------------------------------ *
 * Section 3 — Conversation (21–30)
 * ------------------------------------------------------------------ */

const SECTION3_STIMULUS: ListeningStimulus = {
  section: 3,
  kind: "conversation",
  title: "Questions 21–30 · Environmental science project",
  instruction:
    "Amelia, Ben and Dr Lewis discuss their coursework project. Answer questions 21–30.",
  body: ["Dr Lewis (tutor)", "Amelia, Ben, Carla (students)"],
  lines: [
    { speaker: "Dr Lewis", text: "So, how is the coastal survey going?" },
    { speaker: "Amelia", text: "We finished the pilot study last week — I arranged that one." },
    { speaker: "Ben", text: "I’ve been coding the questionnaire results." },
    { speaker: "Carla", text: "And I collected the water samples from the three sites." },
    { speaker: "Dr Lewis", text: "Good. Remember the report is due on the fourteenth." },
  ],
  audioDurationSec: 132,
};

const STUDENTS = ["Amelia", "Ben", "Carla", "Diego"];

const SECTION3: Seed[] = [
  {
    num: 21,
    type: "matching-information",
    stem: "Who arranged the pilot study?",
    options: STUDENTS,
    correct: "A",
    explanation: "“I arranged that one” — Amelia tự nói về phần của mình.",
    vocab: ["pilot study (n): nghiên cứu thử"],
    transcript: "Amelia: We finished the pilot study last week — I arranged that one.",
  },
  {
    num: 22,
    type: "matching-information",
    stem: "Who coded the questionnaire results?",
    options: STUDENTS,
    correct: "B",
    explanation: "Ben phụ trách nhập/phân tích dữ liệu khảo sát.",
    vocab: ["questionnaire (n): bảng câu hỏi khảo sát"],
    transcript: "Ben: I’ve been coding the questionnaire results.",
  },
  {
    num: 23,
    type: "matching-information",
    stem: "Who collected the water samples?",
    options: STUDENTS,
    correct: "C",
    explanation: "Carla lấy mẫu nước tại ba địa điểm.",
    transcript: "Carla: I collected the water samples from the three sites.",
  },
  {
    num: 24,
    type: "multiple-choice",
    stem: "What problem does Ben mention about the data?",
    options: [
      "Some entries are duplicated",
      "Two files were lost",
      "The sample size is too small",
      "The software keeps crashing",
    ],
    correct: "A",
    explanation: "Dữ liệu bị trùng lặp (duplicated) do nhập hai lần.",
    vocab: ["duplicate (v): nhân bản, nhập trùng"],
    transcript: "Ben: A few entries appear twice — I think we duplicated them.",
  },
  {
    num: 25,
    type: "multiple-choice",
    stem: "When is the report due?",
    options: ["The 4th", "The 10th", "The 14th", "The 24th"],
    correct: "C",
    explanation: "“Due on the fourteenth” — ngày 14.",
    vocab: ["due (adj): đến hạn, phải nộp"],
    transcript: "Dr Lewis: Remember the report is due on the fourteenth.",
  },
  {
    num: 26,
    type: "multiple-choice",
    stem: "What does Dr Lewis suggest they should do next?",
    options: [
      "Add a fourth sampling site",
      "Rewrite the questionnaire",
      "Meet again next Monday",
      "Split the writing between two people",
    ],
    correct: "D",
    explanation: "Giảng viên gợi ý chia việc viết bài cho hai người.",
    transcript: "Dr Lewis: Why don’t you split the writing between two of you?",
  },
  {
    num: 27,
    type: "multiple-selection",
    stem: "Which TWO equipment items do the students still need?",
    options: [
      "A waterproof timer",
      "Two measuring cylinders",
      "A replacement probe",
      "Extra sample bottles",
      "A handheld GPS",
    ],
    correct: "A,C",
    explanation: "Nghe từ “we still need…” — hai vật dụng được nhắc tới là timer và probe.",
    vocab: ["probe (n): đầu dò đo"],
    transcript: "Carla: We still need a waterproof timer — and the pH probe needs replacing.",
  },
  {
    num: 28,
    type: "multiple-selection",
    stem: "Which TWO benefits of the project does Amelia mention?",
    options: [
      "It counts towards the final grade",
      "It looks good on a CV",
      "It can be published",
      "It helps with a summer job",
      "It fulfils the groupwork requirement",
    ],
    correct: "B,E",
    explanation: "Amelia nhắc tới CV và yêu cầu làm nhóm.",
    vocab: ["CV (n): sơ yếu lý lịch"],
    transcript: "Amelia: It’ll be useful for my CV, and it ticks the groupwork box too.",
  },
  {
    num: 29,
    type: "table-completion",
    stem: "Number of participants in the pilot study",
    instruction: "Write ONE NUMBER.",
    correct: "24",
    explanation: "“Twenty-four people took part” → 24 người.",
    transcript: "Amelia: Twenty-four people took part in the end.",
  },
  {
    num: 30,
    type: "table-completion",
    stem: "Next meeting place",
    instruction: "Write NO MORE THAN TWO WORDS.",
    correct: "library/ science library",
    explanation: "Cuộc họp sau tổ chức ở thư viện (science library).",
    vocab: ["the library: thư viện"],
    transcript: "Ben: Shall we use the library again? — Dr Lewis: The science library, yes.",
  },
];

/* ------------------------------------------------------------------ *
 * Section 4 — Lecture / Note completion (31–40)
 * ------------------------------------------------------------------ */

const SECTION4_STIMULUS: ListeningStimulus = {
  section: 4,
  kind: "notes",
  title: "Questions 31–40 · Lecture: The history of paper",
  instruction:
    "You will hear a lecture about the history of paper. Complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
  body: [
    "THE HISTORY OF PAPER — LECTURE NOTES",
    "Early evidence: paper first made in {{31}} around 100 BC",
    "In Europe, paper arrived in {{32}} in the 12th century",
    "A water-powered mill was built in {{33}}",
    "Key qualities of good paper:",
    "  • {{34}} — how much ink it absorbs",
    "  • {{35}} — resistance to tearing",
    "  • Brightness — measured in {{36}}",
    "Production process:",
    "  Step 1 — pulp is {{37}}",
    "  Step 2 — sheets pass through rollers",
    "  Step 3 — sheets are {{38}}",
    "Modern recycling:",
    "  • De-inking uses {{39}} instead of chlorine",
    "  • One tonne of recycled paper saves about {{40}} trees",
  ],
  figureCaption: "Lecture note sheet (demo placeholder)",
  audioDurationSec: 150,
};

const SECTION4: Seed[] = [
  {
    num: 31,
    type: "sentence-completion",
    stem: "Paper was first made in ______ around 100 BC.",
    correct: "China",
    explanation: "Bài giảng nêu rõ giấy ra đời ở Trung Quốc.",
    transcript: "Lecturer: The earliest evidence comes from China, around one hundred BC.",
  },
  {
    num: 32,
    type: "sentence-completion",
    stem: "In Europe, paper arrived in ______ in the 12th century.",
    correct: "Spain",
    explanation: "Giấy đến châu Âu qua Tây Ban Nha thế kỷ 12.",
    vocab: ["arrive in + thành phố/quốc gia"],
    transcript: "Lecturer: Paper reached Europe through Spain in the twelfth century.",
  },
  {
    num: 33,
    type: "sentence-completion",
    stem: "A water-powered mill was built in ______.",
    correct: "Xàivan/Xàiva/Xativa",
    explanation: "Tên riêng: Xàtiva (Tây Ban Nha) — chấp nhận các cách viết phổ biến.",
    transcript: "Lecturer: The first water-powered mill was built at Xàtiva.",
  },
  {
    num: 34,
    type: "sentence-completion",
    stem: "Good paper quality 1: ______ — how much ink it absorbs",
    correct: "absorbency",
    explanation: "Từ loại danh từ: absorbency = khả năng thấm mực.",
    vocab: ["absorbency (n): độ thấm"],
    transcript: "Lecturer: The first quality is absorbency — how much ink the sheet takes.",
  },
  {
    num: 35,
    type: "sentence-completion",
    stem: "Good paper quality 2: ______ — resistance to tearing",
    correct: "strength/durability",
    explanation: "Sức bền giấy được nhắc đến là strength (đôi khi durability).",
    vocab: ["tear (v): xé rách"],
    transcript: "Lecturer: Second, strength — its resistance to tearing.",
  },
  {
    num: 36,
    type: "sentence-completion",
    stem: "Brightness is measured in ______.",
    correct: "percentages/percent",
    explanation: "Độ trắng đo bằng phần trăm.",
    transcript: "Lecturer: Brightness is simply measured in percentages.",
  },
  {
    num: 37,
    type: "flowchart-completion",
    stem: "Production step 1 — pulp is ______",
    instruction: "Write ONE WORD.",
    correct: "mixed/chopped/ground",
    explanation: "Bước đầu: bột giấy được trộn/xay nhuyễn với nước.",
    vocab: ["pulp (n): bột giấy"],
    transcript: "Lecturer: First, the pulp is mixed with water.",
  },
  {
    num: 38,
    type: "flowchart-completion",
    stem: "Production step 3 — sheets are ______",
    instruction: "Write ONE WORD.",
    correct: "dried",
    explanation: "Cuối cùng tấm giấy được sấy khô.",
    transcript: "Lecturer: Finally the sheets pass through heated rollers and are dried.",
  },
  {
    num: 39,
    type: "table-completion",
    stem: "De-inking uses ______ instead of chlorine",
    instruction: "Write NO MORE THAN TWO WORDS.",
    correct: "oxygen/oxygen-based",
    explanation: "Phương pháp tẩy mới dùng oxy thay clo.",
    vocab: ["de-inking (n): khử mực in"],
    transcript: "Lecturer: Modern de-inking uses oxygen rather than chlorine.",
  },
  {
    num: 40,
    type: "table-completion",
    stem: "One tonne of recycled paper saves about ______ trees",
    instruction: "Write ONE NUMBER.",
    correct: "17",
    explanation: "Mỗi tấn giấy tái chế tiết kiệm khoảng 17 cây.",
    transcript: "Lecturer: Roughly seventeen trees are saved for every tonne recycled.",
  },
];

const SECTION_SEEDS: Array<{ section: 1 | 2 | 3 | 4; stimulus: ListeningStimulus; seeds: Seed[] }> = [
  { section: 1, stimulus: SECTION1_STIMULUS, seeds: SECTION1 },
  { section: 2, stimulus: SECTION2_STIMULUS, seeds: SECTION2 },
  { section: 3, stimulus: SECTION3_STIMULUS, seeds: SECTION3 },
  { section: 4, stimulus: SECTION4_STIMULUS, seeds: SECTION4 },
];

let cachedSections: ListeningSectionData[] | null = null;

/** All four listening sections with their stimulus + 10 questions each. */
export function getListeningSections(): ListeningSectionData[] {
  if (!cachedSections) {
    cachedSections = SECTION_SEEDS.map((item) => ({
      config: LISTENING_SECTIONS.find((s) => s.section === item.section) as ListeningSectionConfig,
      stimulus: item.stimulus,
      questions: build(item.section, item.seeds),
    }));
  }
  return cachedSections;
}

/** Flat list of the 40 listening questions (id 1–40). */
export function getListeningQuestions(): IeltsQuestion[] {
  return getListeningSections().flatMap((s) => s.questions);
}
