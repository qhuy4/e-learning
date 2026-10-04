import type {
  QuestionKind,
  StimulusLine,
  ToeicMode,
  ToeicQuestion,
  ToeicStimulus,
  WritingTask,
} from "../types";

/**
 * Demo data for the TOEIC CBT interface (UI only — no backend).
 * `buildToeicQuestions()` generates all 200 Listening/Reading questions
 * following the official part ranges (Part 1: 1–6 … Part 7: 147–200).
 */

const LETTERS = ["A", "B", "C", "D"];

interface Item {
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  kind: QuestionKind;
  stem: string;
  options: string[];
  correct: string;
  explanation: string;
  stimulusId?: string;
  stimulus?: ToeicStimulus;
  vocab?: string[];
  grammar?: string;
}

class QuestionBuilder {
  list: ToeicQuestion[] = [];
  private n = 0;

  add(item: Item): void {
    this.n += 1;
    this.list.push({
      id: this.n,
      section: item.part <= 4 ? "listening" : "reading",
      stimulusId: item.stimulusId ?? null,
      stimulus: item.stimulus ?? null,
      part: item.part,
      kind: item.kind,
      stem: item.stem,
      options: item.options,
      correct: item.correct,
      explanation: item.explanation,
      vocab: item.vocab,
      grammar: item.grammar,
    });
  }
}

/* ------------------------------------------------------------------ *
 * Part 1 — Photographs (6)
 * ------------------------------------------------------------------ */
const PART1: Array<{ stem: string; options: string[]; correct: string }> = [
  {
    stem: "Which sentence best describes the picture?",
    options: [
      "The woman is filing documents.",
      "The man is typing on a keyboard.",
      "The people are shaking hands.",
      "The workers are loading boxes.",
    ],
    correct: "C",
  },
  {
    stem: "What is the woman doing in the picture?",
    options: [
      "She is arranging flowers on a table.",
      "She is talking on the telephone.",
      "She is reading a newspaper.",
      "She is pushing a shopping cart.",
    ],
    correct: "A",
  },
  {
    stem: "What is happening in the picture?",
    options: [
      "A delivery is being signed for.",
      "A meeting is taking place.",
      "A meal is being served.",
      "A presentation is being given.",
    ],
    correct: "B",
  },
  {
    stem: "Where does this picture most likely show?",
    options: [
      "An airport terminal",
      "A construction site",
      "A restaurant kitchen",
      "A post office",
    ],
    correct: "D",
  },
  {
    stem: "What does the man in the picture probably do?",
    options: [
      "He is a chef.",
      "He is a pilot.",
      "He is a mechanic.",
      "He is a photographer.",
    ],
    correct: "C",
  },
  {
    stem: "Which sentence best describes the picture?",
    options: [
      "The shelves are being restocked.",
      "The cars are being washed.",
      "The guests are dancing.",
      "The children are painting.",
    ],
    correct: "A",
  },
];

/* ------------------------------------------------------------------ *
 * Part 2 — Question–Response (25) — 3 options each
 * ------------------------------------------------------------------ */
const PART2: string[][] = [
  ["Every Tuesday afternoon.", "At the front desk.", "Ms. Reyes does."],
  ["About twenty minutes.", "In the conference room.", "Twice a week."],
  ["Yes, I'd be happy to.", "The blue folder.", "Since last month."],
  ["Please send it by e-mail.", "In about an hour.", "Mr. Tanaka did."],
  ["On the second floor.", "They haven't met yet.", "The new manager."],
  ["No, thank you — I have one.", "They were delayed.", "At gate 12."],
  ["For three years now.", "The report is finished.", "By courier."],
  ["Certainly — right this way.", "It's near the elevators.", "Twenty people."],
  ["The trial version is free.", "Last night.", "Because it crashed."],
  ["Yes, the lab is open.", "Dr. Chen.", "Until nine o'clock."],
  ["I'll take the stairs.", "The elevator is broken.", "It's on the tenth floor."],
  ["Yes, the seats are comfortable.", "About five hours.", "It leaves at noon."],
  ["From the human resources office.", "I prefer window seats.", "Next Friday."],
  ["Yes, we delivered it yesterday.", "The tracking number.", "Twenty boxes."],
  ["Not yet — I'm still reviewing it.", "Ms. Alvarez.", "In the archive room."],
];

/* ------------------------------------------------------------------ *
 * Part 3 — Conversations (13 sets × 3 = 39)
 * ------------------------------------------------------------------ */
interface Dialogue {
  title: string;
  lines: StimulusLine[];
  questions: Array<{ stem: string; options: string[]; correct: string; explanation: string }>;
}

const CONVERSATIONS: Dialogue[] = [
  {
    title: "Conversation One",
    lines: [
      { speaker: "Man", text: "Hi, Dana. Do you have a minute? I want to talk about the Henderson project." },
      { speaker: "Woman", text: "Sure. I've just finished the first draft of the budget report." },
      { speaker: "Man", text: "Great. The client moved the deadline up to Friday, so I need your part by Thursday afternoon." },
      { speaker: "Woman", text: "That's fine. I'll also send the revised timeline to Mr. Ortega for approval." },
      { speaker: "Man", text: "Perfect. Let's schedule a short meeting with the design team at ten tomorrow." },
      { speaker: "Woman", text: "All right. I'll book the conference room on the second floor." },
    ],
    questions: [
      {
        stem: "What does the man ask the woman to do?",
        options: [
          "Finish the budget report by Thursday",
          "Call the Henderson client",
          "Review the design team's schedule",
          "Approve the new timeline",
        ],
        correct: "A",
        explanation: "Người đàn ông yêu cầu phần của người phụ nữ xong vào chiều thứ Năm — deadline dời lên sớm hơn.",
      },
      {
        stem: "What do the man and woman plan to do tomorrow?",
        options: ["Visit the client", "Meet the design team", "Present the report", "Train new employees"],
        correct: "B",
        explanation: "Cuối đoạn hội thoại: \"schedule a short meeting with the design team at ten tomorrow\".",
      },
      {
        stem: "What has the woman just completed?",
        options: ["A revised contract", "A customer survey", "The first draft of a report", "A training video"],
        correct: "C",
        explanation: "\"I've just finished the first draft of the budget report.\"",
      },
    ],
  },
  {
    title: "Conversation Two",
    lines: [
      { speaker: "Woman", text: "Have you heard? Our department is moving to the new building on May River Road next month." },
      { speaker: "Man", text: "Really? When exactly?" },
      { speaker: "Woman", text: "The move happens over the weekend of the fourteenth. You need to pack everything on your desk by Friday noon." },
      { speaker: "Man", text: "What about the printers and shared equipment?" },
      { speaker: "Woman", text: "The vendor will transport them. Just label your boxes with your name and department." },
      { speaker: "Man", text: "Got it. Will parking be available there?" },
      { speaker: "Woman", text: "Yes, but employees must register for a parking permit online." },
    ],
    questions: [
      {
        stem: "When will the department move?",
        options: ["At the end of the month", "Over a weekend", "On Friday", "Next year"],
        correct: "B",
        explanation: "\"The move happens over the weekend of the fourteenth.\"",
      },
      {
        stem: "What are employees asked to do by Friday?",
        options: ["Pack their desks", "Move the printers", "Register for permits", "Sign new leases"],
        correct: "A",
        explanation: "\"You need to pack everything on your desk by Friday noon.\"",
      },
      {
        stem: "How can employees obtain parking permits?",
        options: ["From the facilities office", "By calling the vendor", "Online", "At the front desk"],
        correct: "C",
        explanation: "\"… must register for a parking permit online.\"",
      },
    ],
  },
  {
    title: "Conversation Three",
    lines: [
      { speaker: "Man", text: "I need to change my flight to the Denver conference. It's supposed to leave at six." },
      { speaker: "Woman", text: "Let me check. There's a seat on the eight-fifteen flight, but the connection in Chicago is tight." },
      { speaker: "Man", text: "How long is the layover?" },
      { speaker: "Woman", text: "One hour and ten minutes. The next option leaves at nine and gets you in by noon." },
      { speaker: "Man", text: "I'd rather not risk missing the connection. Please book the nine o'clock flight." },
      { speaker: "Woman", text: "All right. There's a fifty-dollar change fee. Shall I charge it to your company card?" },
      { speaker: "Man", text: "Yes, please do." },
    ],
    questions: [
      {
        stem: "What is the man's main concern about the 8:15 flight?",
        options: ["The price", "The short connection", "The seat assignment", "The departure time"],
        correct: "B",
        explanation: "Chuyến 8:15 có thời gian nối chuyến quá chặt (\"the connection in Chicago is tight\").",
      },
      {
        stem: "Which flight does the man choose?",
        options: ["The 6:00 flight", "The 8:15 flight", "The 9:00 flight", "The noon flight"],
        correct: "C",
        explanation: "\"Please book the nine o'clock flight.\"",
      },
      {
        stem: "How will the change fee be paid?",
        options: ["In cash", "With a personal card", "By the airline", "On the company card"],
        correct: "D",
        explanation: "\"Shall I charge it to your company card?\" — \"Yes, please do.\"",
      },
    ],
  },
  {
    title: "Conversation Four",
    lines: [
      { speaker: "Man", text: "Welcome to the team, Priya. I'm Victor from human resources." },
      { speaker: "Woman", text: "Thank you. What should I do first?" },
      { speaker: "Man", text: "Fill out these forms and bring them back before lunch. Then IT will set up your account." },
      { speaker: "Woman", text: "Where is the IT office?" },
      { speaker: "Man", text: "Next to the break room on the first floor. After that, your supervisor will give you a tour of the lab." },
      { speaker: "Woman", text: "Great. Is there a meeting this afternoon?" },
      { speaker: "Man", text: "Yes, at three o'clock in the training room. It's optional but helpful." },
    ],
    questions: [
      {
        stem: "Who is the woman?",
        options: ["A new employee", "A recruiter", "A customer", "An auditor"],
        correct: "A",
        explanation: "Cô được đón tiếp, nhận form và được dẫn đi tham quan → đây là nhân viên mới (new employee).",
      },
      {
        stem: "What must the woman do before lunch?",
        options: ["Take a tour", "Complete some forms", "Meet her supervisor", "Buy office supplies"],
        correct: "B",
        explanation: "\"Fill out these forms and bring them back before lunch.\"",
      },
      {
        stem: "Where will the woman's tour take place?",
        options: ["The lab", "The break room", "The IT office", "The lobby"],
        correct: "A",
        explanation: "\"Your supervisor will give you a tour of the lab.\"",
      },
    ],
  },
  {
    title: "Conversation Five",
    lines: [
      { speaker: "Woman", text: "I bought this blender three months ago, and the motor stopped working yesterday." },
      { speaker: "Man", text: "Do you have your receipt with you?" },
      { speaker: "Woman", text: "Yes, here it is. I purchased it on June 12." },
      { speaker: "Man", text: "It's still under the one-year warranty, so we can send it to the repair center at no charge." },
      { speaker: "Woman", text: "How long will that take?" },
      { speaker: "Man", text: "Usually about ten business days. Meanwhile, you can use this coupon for a discount on a loaner." },
    ],
    questions: [
      {
        stem: "Where does this conversation most likely take place?",
        options: ["At a bank", "In a restaurant", "At a store", "At an airport"],
        correct: "C",
        explanation: "Khách trả lại hàng bị lỗi có biên lai → diễn ra tại cửa hàng (store).",
      },
      {
        stem: "What problem does the woman describe?",
        options: ["A lost receipt", "A broken appliance", "A wrong delivery", "A billing error"],
        correct: "B",
        explanation: "\"The motor stopped working\" → thiết bị hỏng.",
      },
      {
        stem: "What does the clerk offer?",
        options: [
          "A full refund",
          "A free replacement",
          "A free repair and a discount coupon",
          "Free delivery",
        ],
        correct: "C",
        explanation: "Sửa miễn phí (at no charge) + coupon giảm giá máy mượn.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Part 4 — Talks (10 sets × 3 = 30)
 * ------------------------------------------------------------------ */
const TALKS: Dialogue[] = [
  {
    title: "Talk One — Office announcement",
    lines: [
      { speaker: "Speaker", text: "Attention, everyone. This is an announcement from the facilities department." },
      { speaker: "Speaker", text: "Our office will be moving to the Westbrook building next month. Please note the following arrangements." },
      { speaker: "Speaker", text: "First, all employees must return their parking passes to the reception desk by this Friday." },
      { speaker: "Speaker", text: "New passes will be issued at the security office starting Monday." },
      { speaker: "Speaker", text: "Second, the moving company will collect boxes from your work areas between eight and eleven on Saturday morning." },
      { speaker: "Speaker", text: "Finally, if you have questions about the move, contact Lisa Grant at extension 2140." },
    ],
    questions: [
      {
        stem: "What is the main purpose of the announcement?",
        options: ["To introduce a new manager", "To explain moving arrangements", "To announce a holiday", "To advertise parking spaces"],
        correct: "B",
        explanation: "Thông báo giải thích các thỏa thuận liên quan đến việc chuyển văn phòng.",
      },
      {
        stem: "What must employees do by Friday?",
        options: ["Pack their boxes", "Move to Westbrook", "Return parking passes", "Call extension 2140"],
        correct: "C",
        explanation: "\"Return their parking passes … by this Friday.\"",
      },
      {
        stem: "When will boxes be collected?",
        options: ["Monday morning", "Friday evening", "Saturday morning", "Sunday afternoon"],
        correct: "C",
        explanation: "\"… between eight and eleven on Saturday morning.\"",
      },
    ],
  },
  {
    title: "Talk Two — Hotel notice",
    lines: [
      { speaker: "Speaker", text: "Good evening, and welcome to the Grand Plaza Hotel." },
      { speaker: "Speaker", text: "Dinner is served in our restaurant on the second floor until ten o'clock." },
      { speaker: "Speaker", text: "Room service is available twenty-four hours a day; simply dial nine from your room telephone." },
      { speaker: "Speaker", text: "Housekeeping will service your room between nine and eleven tomorrow morning." },
      { speaker: "Speaker", text: "If you would like a wake-up call, please inform the front desk before ten tonight." },
      { speaker: "Speaker", text: "Tomorrow's checkout time is eleven A.M. Thank you for staying with us." },
    ],
    questions: [
      {
        stem: "Who is the audience for this talk?",
        options: ["Hotel guests", "Restaurant staff", "Tour guides", "Airline passengers"],
        correct: "A",
        explanation: "Nội dung về dinner, room service, checkout → dành cho khách lưu trú.",
      },
      {
        stem: "What can guests do at any hour?",
        options: ["Order breakfast", "Use room service", "Check out", "Request laundry"],
        correct: "B",
        explanation: "\"Room service is available twenty-four hours a day.\"",
      },
      {
        stem: "By what time should guests request a wake-up call?",
        options: ["Nine", "Ten", "Eleven", "Midnight"],
        correct: "B",
        explanation: "\"… inform the front desk before ten tonight.\"",
      },
    ],
  },
  {
    title: "Talk Three — Safety training",
    lines: [
      { speaker: "Speaker", text: "Before we begin the safety demonstration, let me go over a few points." },
      { speaker: "Speaker", text: "Our goal is to reduce workplace injuries by half this year." },
      { speaker: "Speaker", text: "Last year, most injuries were caused by improper lifting. Remember to bend your knees and keep loads close to your body." },
      { speaker: "Speaker", text: "Also, always wear the provided gloves when handling glass." },
      { speaker: "Speaker", text: "Finally, report any spills immediately so the floor can be marked. Are there any questions?" },
    ],
    questions: [
      {
        stem: "What is the speaker's main topic?",
        options: ["Fire evacuation", "Workplace safety", "Sales figures", "New equipment"],
        correct: "B",
        explanation: "Toàn bộ bài nói về an toàn lao động (injuries, lifting, gloves, spills).",
      },
      {
        stem: "What caused most injuries last year?",
        options: ["Falling objects", "Chemical spills", "Improper lifting", "Broken glass"],
        correct: "C",
        explanation: "\"Most injuries were caused by improper lifting.\"",
      },
      {
        stem: "Why should spills be reported?",
        options: ["So the floor can be marked", "To get new gloves", "To avoid an inspection", "So machines can stop"],
        correct: "A",
        explanation: "\"Report any spills immediately so the floor can be marked.\"",
      },
    ],
  },
  {
    title: "Talk Four — Community event",
    lines: [
      { speaker: "Speaker", text: "Good morning, listeners. This Saturday, the Maple Avenue Community Center will host its annual Spring Fair." },
      { speaker: "Speaker", text: "The fair opens at ten in the morning and closes at four in the afternoon." },
      { speaker: "Speaker", text: "There will be live music, a book exchange, and food stalls from local restaurants." },
      { speaker: "Speaker", text: "Admission is free, though donations are welcome." },
      { speaker: "Speaker", text: "Visitors are asked to leave their cars at home because nearby lots will be closed for roadwork." },
      { speaker: "Speaker", text: "For more information, visit our Web site." },
    ],
    questions: [
      {
        stem: "When does the fair end?",
        options: ["At nine", "At noon", "At four", "At ten"],
        correct: "C",
        explanation: "\"… closes at four in the afternoon.\"",
      },
      {
        stem: "What is free for visitors?",
        options: ["The food", "Admission", "Parking", "The book exchange"],
        correct: "B",
        explanation: "\"Admission is free, though donations are welcome.\"",
      },
      {
        stem: "Why are visitors asked not to drive?",
        options: ["Lots are closed", "Roads are new", "Cars cost money", "The fair is far away"],
        correct: "A",
        explanation: "\"… because nearby lots will be closed for roadwork.\"",
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Part 5 — Incomplete Sentences (10 × 3 = 30)
 * ------------------------------------------------------------------ */
const PART5: Array<{
  stem: string;
  options: string[];
  correct: string;
  explanation: string;
  vocab?: string[];
  grammar?: string;
}> = [
  {
    stem: "The marketing team will ______ the results of the survey next Monday.",
    options: ["analysis", "analyzed", "analyze", "analyzing"],
    correct: "C",
    explanation: "Sau \"will\" luôn dùng động từ nguyên mẫu.",
    grammar: "will + V (bare infinitive)",
  },
  {
    stem: "Ms. Nakamura was promoted to senior editor ______ her outstanding work last quarter.",
    options: ["due to", "although", "instead of", "unless"],
    correct: "A",
    explanation: "\"due to\" + noun phrase = nguyên nhân (thay cho because of).",
    vocab: ["due to: do, vì", "promote (v): thăng chức"],
    grammar: "due to + noun phrase",
  },
  {
    stem: "All employees must submit their expense reports ______ the end of the month.",
    options: ["until", "by", "since", "during"],
    correct: "B",
    explanation: "\"by + thời điểm\" = hoàn thành trước hoặc vào đúng thời điểm đó.",
    grammar: "by + point in time",
    vocab: ["submit (v): nộp"],
  },
  {
    stem: "The new software is designed to improve ______ between departments.",
    options: ["communicate", "communicated", "communication", "communicator"],
    correct: "C",
    explanation: "Cần danh từ sau \"improve\" → communication.",
    grammar: "verb → noun (suffix -tion)",
    vocab: ["improve (v): cải thiện"],
  },
  {
    stem: "The committee is ______ a new policy on remote work.",
    options: ["discussing", "discuss", "discussed", "to discuss"],
    correct: "A",
    explanation: "\"is + V-ing\" → hiện tại tiếp diễn (đang thảo luận).",
    grammar: "be + V-ing (present progressive)",
  },
  {
    stem: "______ the heavy rain, the outdoor concert proceeded as scheduled.",
    options: ["Because", "Despite", "However", "Unless"],
    correct: "B",
    explanation: "\"Despite\" + noun phrase; \"because\" phải đi kèm mệnh đề.",
    grammar: "despite + noun / in spite of + noun",
    vocab: ["proceed (v): tiếp tục diễn ra"],
  },
  {
    stem: "The factory had to ______ thousands of products after the safety inspection.",
    options: ["reduce", "recall", "remind", "remember"],
    correct: "B",
    explanation: "\"recall products\" = thu hồi sản phẩm; 3 từ còn lại không hợp ngữ cảnh.",
    vocab: ["recall (v): thu hồi", "inspection (n): thanh tra"],
  },
  {
    stem: "______ the report is finished, the client will not approve the budget.",
    options: ["Until", "Although", "Since", "Whether"],
    correct: "A",
    explanation: "\"not … until …\" = không … cho đến khi …",
    grammar: "not … until …",
  },
  {
    stem: "The quarterly sales figures were ______ higher than analysts had predicted.",
    options: ["significant", "significance", "significantly", "signify"],
    correct: "C",
    explanation: "Cần trạng từ modifier cho adjective \"higher\" → significantly.",
    grammar: "adverb + adjective",
  },
  {
    stem: "If the shipment ______ on time, the store would not have run out of stock.",
    options: ["had arrived", "has arrived", "arrives", "was arriving"],
    correct: "A",
    explanation: "Câu điều kiện loại 3 (hàng không có thực): If + past perfect, would have + V3.",
    grammar: "Third conditional: If + had + V3 / would have + V3",
    vocab: ["run out of: hết (hàng hóa)"],
  },
];

/* ------------------------------------------------------------------ *
 * Part 6 — Text Completion (4 passages × 4 = 16)
 * ------------------------------------------------------------------ */
interface PassageItem {
  lines: StimulusLine[];
  questions: Array<{ stem: string; options: string[]; correct: string; explanation: string; vocab?: string[]; grammar?: string }>;
}

const PASSAGES6: PassageItem[] = [
  {
    lines: [
      { text: "From: Rebecca Liu <r.liu@northgateoffice.com>" },
      { text: "To: All Staff" },
      { text: "Subject: Changes to the Monthly Staff Meeting" },
      { text: " " },
      { text: "Dear Colleagues," },
      { text: "Please note that, (1)______ of the renovation work on the third floor, our monthly staff meeting will be held in the training room (2)______ the first floor." },
      { text: "The meeting will begin at 9:00 A.M. on Wednesday, as (3)______. Kindly inform your department head (4)______ Tuesday if you are unable to attend." },
      { text: "Thank you for your cooperation." },
      { text: "Rebecca Liu, Office Manager" },
    ],
    questions: [
      {
        stem: "Blank (1)",
        options: ["in spite of", "due to", "even though", "as well as"],
        correct: "B",
        explanation: "Cần cụm từ + noun phrase chỉ nguyên nhân → \"due to\".",
        grammar: "due to + noun phrase",
      },
      {
        stem: "Blank (2)",
        options: ["from", "at", "on", "by"],
        correct: "C",
        explanation: "\"on the first floor\" — giới từ chỉ tầng.",
        grammar: "on + floor",
      },
      {
        stem: "Blank (3)",
        options: ["usual", "usually", "using", "useless"],
        correct: "A",
        explanation: "\"as usual\" là cụm cố định (adjective).",
        grammar: "as usual (fixed phrase)",
      },
      {
        stem: "Blank (4)",
        options: ["by", "on", "at", "in"],
        correct: "A",
        explanation: "\"by Tuesday\" = chậm nhất vào thứ Ba.",
        grammar: "by + deadline",
      },
    ],
  },
  {
    lines: [
      { text: "GreenRoute Delivery Expands to Rural Areas" },
      { text: " " },
      { text: "Beginning next month, GreenRoute Delivery will offer service to customers in the northern countryside. The company has purchased thirty electric vans and hired fifty new drivers." },
      { text: "Because roads in the region are often (1)______ in winter, deliveries may take an extra day between December and February. Customers who need items urgently can still choose express service for an additional fee." },
      { text: "To celebrate the expansion, GreenRoute will donate one book to a local school for every parcel (2)______ during the first week. Residents can track packages on the GreenRoute app or by (3)______ the company's Web site. Those interested in joining the team should apply (4)______ May 30." },
    ],
    questions: [
      {
        stem: "Blank (1)",
        options: ["blocked", "blocking", "block", "blocks"],
        correct: "A",
        explanation: "\"roads are blocked\" → trạng thái bị động (past participle).",
        grammar: "be + V3 (passive)",
        vocab: ["express service: dịch vụ giao nhanh"],
      },
      {
        stem: "Blank (2)",
        options: ["deliver", "delivered", "delivering", "delivery"],
        correct: "B",
        explanation: "Parcel được giao → dùng phân từ quá khứ \"delivered\" làm tiền ngữ.",
        grammar: "past participle as post-modifier",
      },
      {
        stem: "Blank (3)",
        options: ["visit", "visited", "visiting", "visits"],
        correct: "C",
        explanation: "Sau giới từ \"by\" cần V-ing.",
        grammar: "by + V-ing",
      },
      {
        stem: "Blank (4)",
        options: ["until", "by", "after", "before"],
        correct: "B",
        explanation: "Hạn chót nộp hồ sơ → \"by May 30\".",
        grammar: "by + deadline",
      },
    ],
  },
  {
    lines: [
      { text: "NOTICE: Revised Library Hours" },
      { text: " " },
      { text: "Starting Monday, the Central Library will close at 6:00 P.M. instead of 8:00 P.M. The change is (1)______ a shortage of evening staff. Weekend hours will remain the same." },
      { text: "Items can also be renewed (2)______ the library's online portal." },
      { text: "Items not (3)______ before 6:00 P.M. must be collected the same day; otherwise, a two-day extension will be applied." },
      { text: "The library hopes to restore normal hours (4)______ March." },
    ],
    questions: [
      {
        stem: "Blank (1)",
        options: ["due to", "because", "unless", "whether"],
        correct: "A",
        explanation: "Sau \"is\" + noun phrase (a shortage) → \"due to\"; \"because\" cần mệnh đề.",
        grammar: "due to + noun (vs. because + clause)",
        vocab: ["shortage (n): sự thiếu hụt"],
      },
      {
        stem: "Blank (2)",
        options: ["through", "despite", "unless", "whether"],
        correct: "A",
        explanation: "\"through the portal\" = thông qua cổng trực tuyến.",
        grammar: "through + means/tool",
        vocab: ["renew (v): gia hạn"],
      },
      {
        stem: "Blank (3)",
        options: ["collect", "collected", "collecting", "collects"],
        correct: "B",
        explanation: "\"Items not collected\" → bị động.",
        grammar: "passive: be + V3",
      },
      {
        stem: "Blank (4)",
        options: ["on", "in", "at", "until"],
        correct: "B",
        explanation: "Tháng → \"in March\".",
        grammar: "in + month",
      },
    ],
  },
  {
    lines: [
      { text: "Why Companies Are Rethinking the Break Room" },
      { text: " " },
      { text: "A recent survey of 2,000 office workers found that nearly half skip their lunch break (1)______ heavy workloads. Nutritionists warn that working through lunch does not improve productivity; instead, it often leads to afternoon tiredness." },
      { text: "Some companies have responded by creating quiet rooms (2)______ employees can eat without their phones. Others provide free fruit or host weekly walking groups. Experts say such programs are inexpensive and (3)______ companies retain staff." },
      { text: "Employees, meanwhile, want more than snacks. Many say that flexible break schedules matter (4)______ than free coffee." },
    ],
    questions: [
      {
        stem: "Blank (1)",
        options: ["because", "due to", "although", "so that"],
        correct: "B",
        explanation: "\"due to + noun phrase\" (heavy workloads).",
        grammar: "due to + noun",
        vocab: ["productivity (n): năng suất"],
      },
      {
        stem: "Blank (2)",
        options: ["which", "where", "what", "whose"],
        correct: "B",
        explanation: "Chỉ nơi → quan hệ \"where\".",
        grammar: "relative clause of place: where",
      },
      {
        stem: "Blank (3)",
        options: ["help", "helps", "helped", "helping"],
        correct: "A",
        explanation: "Đồng nhất với \"are inexpensive and …\" → động từ nguyên mẫu.",
        grammar: "parallel structure",
        vocab: ["retain (v): giữ chân (nhân viên)"],
      },
      {
        stem: "Blank (4)",
        options: ["more", "most", "much", "many"],
        correct: "A",
        explanation: "\"matter more than\" — so sánh hơn của much/many → more.",
        grammar: "comparative: more … than …",
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Part 7 — Reading Comprehension (15 sets → 54 questions)
 * ------------------------------------------------------------------ */
interface PassageTemplate {
  lines: StimulusLine[];
  questions: Array<{ stem: string; options: string[]; correct: string; explanation: string; vocab?: string[]; grammar?: string }>;
}

const PASSAGES7: PassageTemplate[] = [
  {
    // T1 — single passage (3)
    lines: [
      { text: "MERIDIAN BOOKS — STORE MANAGER WANTED" },
      { text: " " },
      { text: "Meridian Books, a family-owned bookstore in Riverbend, is looking for an experienced store manager. The successful applicant will supervise a team of eight, manage inventory, and organize monthly author events." },
      { text: "Requirements:" },
      { text: "• At least three years of retail experience" },
      { text: "• Strong computer and scheduling skills" },
      { text: "• Weekend availability" },
      { text: "Salary: $4,200 per month, plus performance bonus." },
      { text: "To apply, send a résumé and a short cover letter to jobs@meridianbooks.com before October 15." },
    ],
    questions: [
      {
        stem: "What is the main purpose of the notice?",
        options: ["To advertise a job", "To announce a sale", "To introduce an author", "To recruit volunteers"],
        correct: "A",
        explanation: "Đăng tuyển dụng (store manager) → quảng cáo việc làm.",
        vocab: ["applicant (n): người ứng tuyển", "inventory (n): tồn kho"],
      },
      {
        stem: "What is required of applicants?",
        options: ["A college degree", "Weekend availability", "Five years of experience", "Marketing knowledge"],
        correct: "B",
        explanation: "Danh sách yêu cầu có dòng \"Weekend availability\".",
      },
      {
        stem: "How can interested people apply?",
        options: ["By visiting the store", "By calling the manager", "By sending documents by e-mail", "By filling out a form online"],
        correct: "C",
        explanation: "\"send a résumé and a short cover letter to jobs@…\"",
        vocab: ["résumé (n): sơ yếu lý lịch"],
      },
    ],
  },
  {
    // T2 — double passage (4)
    lines: [
      { text: "From: Daniel Ortiz <d.ortiz@brightline.io>" },
      { text: "To: Events Team <events@brightline.io>" },
      { text: "Subject: Registration problem" },
      { text: " " },
      { text: "Hello," },
      { text: "I registered for the Brightline Design Conference last week and received a confirmation e-mail, but my colleague in the same department has not received hers. We both used the company's group registration form. Could you check whether her application went through? Her name is Mei Tanaka." },
      { text: "Also, is it still possible to switch to the two-day pass? Our project schedule changed, and now we plan to attend both days." },
      { text: "Thank you, Daniel Ortiz — Marketing Department" },
      { text: " " },
      { text: "--- Reply ---" },
      { text: "From: Events Team <events@brightline.io>" },
      { text: "Hi Daniel," },
      { text: "Ms. Tanaka's application is in our system; the confirmation e-mail was blocked by your company's spam filter. We have re-sent it." },
      { text: "Upgrading to the two-day pass is possible until September 30. The price difference is $120. Just reply to this e-mail and we will send an invoice." },
    ],
    questions: [
      {
        stem: "Why did Daniel write the first e-mail?",
        options: ["To cancel his registration", "To ask about a missing confirmation", "To request a refund", "To change the venue"],
        correct: "B",
        explanation: "Anh ta hỏi về e-mail xác nhận của đồng nghiệp chưa nhận được.",
        vocab: ["confirmation (n): xác nhận"],
      },
      {
        stem: "What happened to Ms. Tanaka's confirmation e-mail?",
        options: ["It was never sent", "It was blocked by a spam filter", "It contained an error", "It was sent to the wrong address"],
        correct: "B",
        explanation: "\"… was blocked by your company's spam filter.\"",
        vocab: ["spam filter: bộ lọc thư rác"],
      },
      {
        stem: "How much is the price difference for the upgrade?",
        options: ["$20", "$100", "$120", "It is free"],
        correct: "C",
        explanation: "\"The price difference is $120.\"",
      },
      {
        stem: "What must Daniel do to upgrade?",
        options: ["Fill out a new form", "Reply to the e-mail", "Call the events team", "Visit the office"],
        correct: "B",
        explanation: "\"Just reply to this e-mail and we will send an invoice.\"",
        vocab: ["invoice (n): hóa đơn"],
      },
    ],
  },
  {
    // T3 — single passage (3)
    lines: [
      { text: "TEMPORARY SHUTTLE ROUTE CHANGE" },
      { text: " " },
      { text: "Because of construction on Harbor Road, the airport shuttle will use Market Street from October 3 through October 21." },
      { text: "Passengers should wait at the stop in front of the Central Post Office instead of the usual corner of Harbor Road and Fifth Avenue." },
      { text: "Morning departures will leave five minutes earlier than usual to account for traffic. Evening schedules will not change." },
      { text: "Passengers with questions may call the transit line at 555-0184 between 7:00 A.M. and 7:00 P.M." },
    ],
    questions: [
      {
        stem: "Why has the route changed?",
        options: ["New buses were bought", "Road construction", "A local festival", "Bad weather"],
        correct: "B",
        explanation: "\"Because of construction on Harbor Road.\"",
        vocab: ["construction (n): thi công"],
      },
      {
        stem: "Where should passengers wait?",
        options: ["At the airport", "On Harbor Road", "In front of the Central Post Office", "At Fifth Avenue"],
        correct: "C",
        explanation: "\"… wait at the stop in front of the Central Post Office.\"",
      },
      {
        stem: "Which statement about the shuttle is true?",
        options: ["Evening trips are canceled", "Morning trips leave earlier", "Evening trips leave later", "Trips run only on weekends"],
        correct: "B",
        explanation: "\"Morning departures will leave five minutes earlier … Evening schedules will not change.\"",
      },
    ],
  },
  {
    // T4 — triple passage (5)
    lines: [
      { text: "From: Travel Desk <travel@vantagecorp.com>" },
      { text: "To: Sofia Reyes" },
      { text: "Subject: Your trip to Seattle — details" },
      { text: " " },
      { text: "FLIGHT INFORMATION" },
      { text: "Outbound: VX 612, departs 7:45 A.M. Monday, arrives 10:30 A.M." },
      { text: "Return: VX 620, departs 6:15 P.M. Friday." },
      { text: " " },
      { text: "HOTEL ACCOMMODATION" },
      { text: "Lakeview Inn, Room 412 — check-in Monday after 3:00 P.M., check-out Friday before 11:00 A.M. Breakfast is included." },
      { text: " " },
      { text: "PLANT VISIT" },
      { text: "Your tour with Mr. Feld starts at 1:00 P.M. on Tuesday. Please bring safety shoes; goggles will be provided on site." },
      { text: "Remember to submit receipts for expenses over $50 within a week of your return." },
    ],
    questions: [
      {
        stem: "When will Sofia arrive in Seattle?",
        options: ["Monday morning", "Monday afternoon", "Tuesday morning", "Friday evening"],
        correct: "A",
        explanation: "Chuyến đi 7:45 A.M. Monday, đến 10:30 A.M. → buổi sáng thứ Hai.",
        grammar: "a.m. = before noon",
      },
      {
        stem: "What is included in the hotel price?",
        options: ["Dinner", "Parking", "Breakfast", "Airport transfer"],
        correct: "C",
        explanation: "\"Breakfast is included.\"",
        vocab: ["accommodation (n): chỗ ở"],
      },
      {
        stem: "What must Sofia bring?",
        options: ["Goggles", "Safety shoes", "A uniform", "A laptop"],
        correct: "B",
        explanation: "\"Please bring safety shoes; goggles will be provided on site.\"",
        vocab: ["goggles (n): kính bảo hộ"],
      },
      {
        stem: "When is the plant tour?",
        options: ["Monday at 1:00 P.M.", "Tuesday at 1:00 P.M.", "Tuesday morning", "Friday afternoon"],
        correct: "B",
        explanation: "\"Your tour with Mr. Feld starts at 1:00 P.M. on Tuesday.\"",
      },
      {
        stem: "What must be done with large expense receipts?",
        options: ["Mail them", "Submit them within a week", "Give them to Mr. Feld", "Keep them for a year"],
        correct: "B",
        explanation: "\"… submit receipts for expenses over $50 within a week of your return.\"",
        vocab: ["receipt (n): biên lai"],
      },
    ],
  },
  {
    // T5 — double passage (4)
    lines: [
      { text: "MAPLE GARDEN CLUB — AUTUMN PROGRAM" },
      { text: " " },
      { text: "New members are welcome! This October, the club offers three workshops: composting basics (October 7), container planting (October 14), and pruning for beginners (October 21). Each workshop runs from 6:00 to 8:00 P.M. in the Community Hall." },
      { text: "Fees: members $15 per workshop; non-members $25. Family memberships cost $60 per year and cover two adults and any children under 18." },
      { text: " " },
      { text: "--- Sign-up form ---" },
      { text: "Autumn Workshop Registration" },
      { text: "Name: ______________________" },
      { text: "E-mail: _____________________" },
      { text: "Workshop(s): __________________" },
      { text: "Membership status: □ Member  □ Non-member" },
      { text: "Payment: □ Cash  □ Check  □ Card" },
    ],
    questions: [
      {
        stem: "Who pays $15 for a workshop?",
        options: ["A member", "A non-member", "A family", "A student"],
        correct: "A",
        explanation: "\"members $15 per workshop; non-members $25.\"",
      },
      {
        stem: "When is container planting offered?",
        options: ["October 7", "October 14", "October 21", "November 1"],
        correct: "B",
        explanation: "\"container planting (October 14)\".",
        vocab: ["workshop (n): hội thảo / lớp tập huấn"],
      },
      {
        stem: "What does a family membership cover?",
        options: ["Two adults and children under 18", "Only one adult", "Workshops only", "Tools and seeds"],
        correct: "A",
        explanation: "\"Family memberships … cover two adults and any children under 18.\"",
      },
      {
        stem: "Which payment method is NOT listed on the form?",
        options: ["Cash", "Check", "Card", "Bank transfer"],
        correct: "D",
        explanation: "Form chỉ có Cash, Check, Card — không có bank transfer.",
      },
    ],
  },
  {
    // T6 — single passage (3)
    lines: [
      { text: "A QUIETER WAY TO COMMUTE" },
      { text: " " },
      { text: "Urban Cycles has released the Model Q, an electric bicycle designed for city traffic. Unlike earlier versions, the Model Q uses a belt drive instead of a chain, which makes it nearly silent and reduces cleaning." },
      { text: "The bike weighs 18 kilograms and travels up to 70 kilometers on a single charge. Test riders noted that the brakes respond quickly, although the seat feels firm on longer rides." },
      { text: "At $1,650, the Model Q is more expensive than most competitors. However, reviewers agree that its low maintenance costs balance the higher price over time." },
    ],
    questions: [
      {
        stem: "What is different about the Model Q?",
        options: ["It has no brakes", "It is nearly silent", "It weighs less", "It costs less"],
        correct: "B",
        explanation: "\"… a belt drive instead of a chain, which makes it nearly silent.\"",
        vocab: ["belt drive: truyền động bằng dây đai"],
      },
      {
        stem: "What did some riders criticize?",
        options: ["The battery", "The seat", "The belt drive", "The weight"],
        correct: "B",
        explanation: "\"… although the seat feels firm on longer rides.\"",
        vocab: ["firm (adj): cứng"],
      },
      {
        stem: "Why do reviewers think the price is reasonable?",
        options: ["It includes insurance", "Maintenance costs are low", "It is on sale", "It is the lightest"],
        correct: "B",
        explanation: "\"… its low maintenance costs balance the higher price over time.\"",
        vocab: ["maintenance (n): bảo trì"],
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Builder
 * ------------------------------------------------------------------ */
export function buildToeicQuestions(): ToeicQuestion[] {
  const b = new QuestionBuilder();

  // Part 1
  for (const item of PART1) {
    const correctText = item.options[LETTERS.indexOf(item.correct)] ?? "";
    b.add({
      part: 1,
      kind: "photo",
      stem: item.stem,
      options: item.options,
      correct: item.correct,
      explanation: `Đáp án ${item.correct} — "${correctText}" là mô tả đúng nhất bức tranh; các đáp án còn lại nêu hoạt động hoặc địa điểm không xuất hiện trong hình.`,
      stimulusId: `p1-${b.list.length + 1}`,
      stimulus: { title: `Picture ${b.list.length + 1}`, audioLabel: `Question ${b.list.length + 1}` },
    });
  }

  // Part 2 (25)
  for (let i = 0; i < 25; i += 1) {
    const options = PART2[i % PART2.length];
    const answerIndex = i % 3;
    const n = b.list.length + 1;
    b.add({
      part: 2,
      kind: "response",
      stem: "",
      options,
      correct: LETTERS[answerIndex],
      explanation: `Đáp án ${LETTERS[answerIndex]} — "${options[answerIndex]}" là câu trả lời trực tiếp, đúng thông tin của câu hỏi/câu nói bạn nghe; hai đáp án còn lại lệch chủ đề (trả lời nhầm loại câu hỏi).`,
      stimulusId: `p2-${n}`,
      stimulus: { title: "Question-Response", audioLabel: `Question ${n}` },
    });
  }

  // Part 3 — 13 conversation sets × 3
  for (let set = 0; set < 13; set += 1) {
    const tpl = CONVERSATIONS[set % CONVERSATIONS.length];
    const first = b.list.length + 1;
    const stimulusId = `p3-${set}`;
    const stimulus: ToeicStimulus = {
      title: `Conversation ${set + 1}`,
      audioLabel: `Questions ${first}–${first + 2}`,
      lines: tpl.lines,
    };
    for (let j = 0; j < 3; j += 1) {
      const q = tpl.questions[j];
      b.add({
        part: 3,
        kind: "conversation",
        stem: q.stem,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        stimulusId,
        stimulus,
      });
    }
  }

  // Part 4 — 10 talk sets × 3
  for (let set = 0; set < 10; set += 1) {
    const tpl = TALKS[set % TALKS.length];
    const first = b.list.length + 1;
    const stimulusId = `p4-${set}`;
    const stimulus: ToeicStimulus = {
      title: tpl.title,
      audioLabel: `Questions ${first}–${first + 2}`,
      lines: tpl.lines,
    };
    for (let j = 0; j < 3; j += 1) {
      const q = tpl.questions[j];
      b.add({
        part: 4,
        kind: "talk",
        stem: q.stem,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        stimulusId,
        stimulus,
      });
    }
  }

  // Part 5 — 30
  for (let i = 0; i < 30; i += 1) {
    const item = PART5[i % PART5.length];
    b.add({
      part: 5,
      kind: "incomplete",
      stem: item.stem,
      options: item.options,
      correct: item.correct,
      explanation: item.explanation,
      vocab: item.vocab,
      grammar: item.grammar,
    });
  }

  // Part 6 — 4 passages × 4
  for (let p = 0; p < PASSAGES6.length; p += 1) {
    const tpl = PASSAGES6[p];
    const stimulusId = `p6-${p}`;
    const stimulus: ToeicStimulus = {
      title: `Reading Passage ${p + 1}`,
      lines: tpl.lines,
    };
    for (let j = 0; j < 4; j += 1) {
      const q = tpl.questions[j];
      b.add({
        part: 6,
        kind: "text-completion",
        stem: q.stem,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        vocab: q.vocab,
        grammar: q.grammar,
        stimulusId,
        stimulus,
      });
    }
  }

  // Part 7 — 15 sets (sizes per template) → 54 questions
  const sizes = [3, 4, 3, 5, 4, 3]; // aligned with PASSAGES7 pools
  for (let set = 0; set < 15; set += 1) {
    const tplIdx = set % PASSAGES7.length;
    const tpl = PASSAGES7[tplIdx];
    const size = sizes[tplIdx];
    const stimulusId = `p7-${set}`;
    const stimulus: ToeicStimulus = {
      title: `Reading Passage ${set + 1}`,
      lines: tpl.lines,
    };
    for (let j = 0; j < size; j += 1) {
      const q = tpl.questions[j % tpl.questions.length];
      b.add({
        part: 7,
        kind: "comprehension",
        stem: q.stem,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        vocab: q.vocab,
        grammar: q.grammar,
        stimulusId,
        stimulus,
      });
    }
  }

  return b.list;
}

let cachedQuestions: ToeicQuestion[] | null = null;
/** Cached accessor — builds all 200 questions only once per session. */
export function getToeicQuestions(): ToeicQuestion[] {
  if (!cachedQuestions) cachedQuestions = buildToeicQuestions();
  return cachedQuestions;
}

/* ------------------------------------------------------------------ *
 * Writing tasks (8)
 * ------------------------------------------------------------------ */
export const TOEIC_WRITING_TASKS: WritingTask[] = [
  {
    id: 1,
    type: "Viết câu từ tranh",
    title: "Write a Sentence from a Picture",
    prompt: "Look at the picture and write ONE sentence that describes it accurately. Use complete grammar.",
    keywords: ["meeting", "discuss", "schedule", "presentation"],
    minWords: 10,
    hasImage: true,
  },
  {
    id: 2,
    type: "Phản hồi email",
    title: "Respond to an E-mail",
    prompt: "You are Naomi Chen. Write an e-mail responding to Mr. Park's request. Include a greeting, your answer, and a closing.",
    email: { from: "Daniel Park <d.park@horizonhotels.com>", subject: "Question about your recent order" },
    minWords: 30,
  },
  {
    id: 3,
    type: "Bài luận quan điểm",
    title: "Opinion Essay",
    prompt: "Do you agree that companies should allow employees to work from home three days a week? Explain your reasons with specific examples.",
    keywords: ["productivity", "commute", "teamwork", "flexibility"],
    minWords: 80,
  },
  {
    id: 4,
    type: "Phản hồi email công việc",
    title: "Respond to a Workplace E-mail",
    prompt: "Reply to your colleague about the revised project timeline. Confirm the new deadlines and mention one possible risk.",
    email: { from: "Laura Bennett <l.bennett@brightstar.co>", subject: "Revised timeline for the Q4 launch" },
    minWords: 40,
  },
  {
    id: 5,
    type: "Viết ghi chú công sở",
    title: "Write a Workplace Note",
    prompt: "Write a short note to your team about the office closure on Friday. Include the reason, duration, and what they should prepare.",
    keywords: ["closure", "prepare", "deadline"],
    minWords: 25,
  },
  {
    id: 6,
    type: "Phản hồi email khiếu nại",
    title: "Respond to a Complaint",
    prompt: "A customer complains about a delayed delivery. Write a polite e-mail apologizing and offering a solution.",
    email: { from: "Robert Hale <r.hale@examplemail.com>", subject: "My order has not arrived" },
    minWords: 40,
  },
  {
    id: 7,
    type: "Bài luận so sánh",
    title: "Comparison Essay",
    prompt: "Compare working in a large company versus a small company. Which do you think is better for career growth? Why?",
    keywords: ["salary", "advancement", "resources", "culture"],
    minWords: 80,
  },
  {
    id: 8,
    type: "Phản hồi email đặt lịch",
    title: "Respond to a Scheduling Request",
    prompt: "A client wants to move next week's training session. Reply with two alternative times and confirm the room booking.",
    email: { from: "Ingrid Sørensen <i.sorensen@nordictech.dk>", subject: "Moving the training session" },
    minWords: 30,
  },
];

/* ------------------------------------------------------------------ *
 * Landing / instructions / result demo data
 * ------------------------------------------------------------------ */
export const MOCK_CANDIDATE = {
  name: "Nguyễn Minh Anh",
  candidateId: "CBT-2026-08142",
  testCode: "TOEIC-LR-01",
  testDate: "26/09/2026",
  attemptsLeft: 2,
};

/** Demo stats for the landing preview — one entry per mode (each đề previews only its own). */
export interface LandingModeInfo {
  /** Tổng câu (L&R) hoặc tổng task (Writing/Speaking) của đề đầy đủ. */
  total: number;
  /** Thời lượng đầy đủ (phút) — khớp SECTION_META. */
  totalMinutes: number;
  level: string;
  attempts: number;
  lastScore: number;
  /** Thang điểm cao nhất của mode (L&R 990 · Writing/Speaking 200). */
  scoreMax: number;
  isPremium: boolean;
}

export const MOCK_LANDING_INFO: Record<ToeicMode, LandingModeInfo> = {
  lr: {
    total: 200,
    totalMinutes: 120,
    level: "Elementary → Advanced",
    attempts: 3,
    lastScore: 735,
    scoreMax: 990,
    isPremium: false,
  },
  writing: {
    total: 8,
    totalMinutes: 60,
    level: "Elementary → Advanced",
    attempts: 2,
    lastScore: 160,
    scoreMax: 200,
    isPremium: false,
  },
  speaking: {
    total: 11,
    totalMinutes: 20,
    level: "Elementary → Advanced",
    attempts: 2,
    lastScore: 150,
    scoreMax: 200,
    isPremium: false,
  },
};

export const SECTION_DESCRIPTIONS: Record<string, string> = {
  "1": "Chọn câu mô tả đúng bức tranh",
  "2": "Chọn câu trả lời phù hợp nhất",
  "3": "Nghe hội thoại, trả lời 3 câu",
  "4": "Nghe đoạn thông báo, trả lời 3 câu",
  "5": "Hoàn thành câu còn thiếu",
  "6": "Điền vào đoạn văn ngắn",
  "7": "Đọc hiểu 1, 2 hoặc 3 văn bản",
};

/** Average minutes per part (mock analytics). */
export const TIME_PER_PART: Record<string, number> = {
  "1": 2,
  "2": 6,
  "3": 20,
  "4": 14,
  "5": 14,
  "6": 16,
  "7": 34,
};

/** Deterministic preset answer sheet used when opening /toeic/result directly. */
export function buildPresetAnswers(): Record<number, string> {
  const answers: Record<number, string> = {};
  for (const q of buildToeicQuestions()) {
    const r = q.id % 10;
    if (r <= 6) answers[q.id] = q.correct;
    else if (r <= 8) {
      const idx = LETTERS.indexOf(q.correct);
      answers[q.id] = LETTERS[(idx + 1) % q.options.length];
    }
  }
  return answers;
}

export const PRESET_DRAFTS: Record<number, string> = {
  1: "Two colleagues are discussing the schedule of an upcoming meeting in an office.",
  2: "Dear Mr. Park, thank you for reaching out. I am writing to confirm that your order was shipped yesterday and it should arrive by Friday. Please let me know if you need any further assistance. Best regards, Naomi Chen",
  3: "I agree that companies should allow employees to work from home three days a week because it saves time spent on commuting and lets people focus better. In my previous job, my productivity increased when I could plan my own day. However, teams should still meet in person once a week to keep good communication.",
};
