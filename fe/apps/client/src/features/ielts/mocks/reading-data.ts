import { READING_PASSAGES } from "../constants";
import type {
  IeltsQuestion,
  QuestionType,
  ReadingPassage,
  ReadingPassageConfig,
} from "../types";

/**
 * Reading mock data — 3 passages (13/14/13 questions = 40), covering all 16
 * official IELTS reading question types. UI-only demo content (English).
 */

export interface ReadingPassageData {
  config: ReadingPassageConfig;
  passage: ReadingPassage;
  questions: IeltsQuestion[];
}

interface Seed {
  num: number;
  type: QuestionType;
  stem: string;
  instruction?: string;
  options?: string[];
  letters?: string[];
  correct: string;
  explanation: string;
  vocab?: string[];
  evidence?: string;
  paragraph?: string;
}

function instructionFor(seed: Seed): string {
  if (seed.instruction) return seed.instruction;
  switch (seed.type) {
    case "true-false-not-given":
      return "Do the statements agree with the information in the passage? TRUE / FALSE / NOT GIVEN.";
    case "yes-no-not-given":
      return "Does the writer agree with these claims? YES / NO / NOT GIVEN.";
    case "matching-headings":
      return "Choose the correct heading for the paragraph from the list of headings.";
    case "matching-paragraph-information":
      return "Write the correct letter, A–H.";
    case "matching-sentence-endings":
      return "Choose the correct ending, A–F.";
    case "matching-features":
      return "Choose the correct feature, A–D.";
    case "matching-names":
      return "Which researcher (A–D) says this?";
    case "multiple-choice":
      return "Choose the correct letter, A–D.";
    case "multiple-answer":
      return "Choose the correct letters, A–E. Choose TWO answers.";
    case "short-answer":
      return "Write NO MORE THAN TWO WORDS AND/OR A NUMBER.";
    default:
      return "Write NO MORE THAN TWO WORDS AND/OR A NUMBER.";
  }
}

function build(passage: 1 | 2 | 3, seeds: Seed[]): IeltsQuestion[] {
  const config = READING_PASSAGES.find((p) => p.passage === passage) as ReadingPassageConfig;
  const base = config.from - 1;
  return seeds.map((seed) => ({
    id: base + seed.num,
    num: seed.num,
    module: "reading" as const,
    type: seed.type,
    group: passage,
    instruction: instructionFor(seed),
    stem: seed.stem,
    options: seed.options,
    letters: seed.letters,
    correct: seed.correct,
    explanation: seed.explanation,
    vocab: seed.vocab,
    evidence: seed.evidence,
    paragraph: seed.paragraph,
  }));
}

/* ================================================================== *
 * PASSAGE 1 — The Rise of Urban Farming (41–53)
 * ================================================================== */

const PASSAGE1: ReadingPassage = {
  passage: 1,
  title: "The Rise of Urban Farming",
  topic: "Agriculture · Cities · Sustainability",
  paragraphs: [
    {
      label: "A",
      text: "As more than half of the world's population now lives in cities, the distance between field and plate has grown steadily longer. In response, a quiet revolution has taken place on balconies, rooftops and abandoned lots: urban farming. Its supporters argue that city-grown food is fresher, travels less and reconnects residents with the seasons.",
    },
    {
      label: "B",
      text: "Urban agriculture is not new. During the two world wars, governments on both sides of the Atlantic urged citizens to plant 'victory gardens' in back gardens and public parks, and at their peak these plots supplied a remarkable share of the vegetables eaten in Britain and the United States. The movement faded after 1945, only to return in the 1970s.",
    },
    {
      label: "C",
      text: "Rooftop growing is the most visible form of the movement today. A productive green roof must first be engineered: the substrate, when wet, can weigh several times more than the structure below was designed to carry, and older buildings often cannot support it without expensive reinforcement. Irrigation adds a further cost, since water must be pumped to the top of the building.",
    },
    {
      label: "D",
      text: "Some growers have bypassed soil altogether. Hydroponic systems feed plant roots a mineral solution, while aeroponic mists suspend them in air; both can produce crops in shipping containers or disused car parks. Yields per square metre may be several times higher than in open fields, although the equipment and the electricity it consumes remain expensive.",
    },
    {
      label: "E",
      text: "Community gardens deliver benefits that never appear in a harvest count. Studies in Detroit and Melbourne have linked regular gardening with lower reported stress, and plots managed by several families tend to become informal meeting places where recipes, seeds and news are exchanged. Researchers describe the social harvest as being at least as important as the edible one.",
    },
    {
      label: "F",
      text: "Money, however, is the recurring weakness. A small urban plot rarely covers its own costs, and most projects survive on volunteer labour, council grants or the goodwill of landowners who allow temporary use of empty sites. Where the food is sold directly through farm shops and weekly markets, income improves, but few operations reach the scale needed to become genuinely profitable.",
    },
    {
      label: "G",
      text: "Health regulators point to a less cheerful history. Soil in long-built-up areas may contain lead from former petrol, paint or industrial works, and roots can take this up into edible leaves. Some cities now insist on soil testing before planting, and a handful require raised beds filled with clean compost on any site with a manufacturing past.",
    },
    {
      label: "H",
      text: "The future is likely to be planned rather than accidental. Architects increasingly reserve roof space for growing, transport networks are being asked to carry produce from nearby peri-urban farms, and several municipalities have written food production into their climate strategies. Whether cities ever feed themselves completely remains doubtful, but the idea has clearly taken root.",
    },
  ],
  footnote: "Adapted academic text for IELTS practice — demo content, not for commercial reuse.",
};

const HEADINGS = [
  "A brief history of city agriculture",
  "Growing on rooftops: benefits and limits",
  "Farming without soil",
  "Social rewards beyond the harvest",
  "The true cost of transporting food",
  "Health risks and legal safeguards",
  "What tomorrow's cities may grow",
  "Machines that replace farm workers",
];

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];

const PASSAGE1_QUESTIONS: Seed[] = [
  {
    num: 1,
    type: "matching-headings",
    stem: "Paragraph C",
    options: HEADINGS,
    letters: ROMAN,
    correct: "ii",
    explanation: "Đoạn C nêu lợi ích và giới hạn của việc trồng trọt trên sân thượng (trọng lượng, tưới tiêu).",
    paragraph: "C",
    evidence: "A productive green roof must first be engineered … older buildings often cannot support it.",
  },
  {
    num: 2,
    type: "matching-headings",
    stem: "Paragraph D",
    options: HEADINGS,
    letters: ROMAN,
    correct: "iii",
    explanation: "Đoạn D mô tả canh tác không cần đất (hydroponic, aeroponic).",
    paragraph: "D",
    evidence: "Some growers have bypassed soil altogether.",
  },
  {
    num: 3,
    type: "matching-headings",
    stem: "Paragraph E",
    options: HEADINGS,
    letters: ROMAN,
    correct: "iv",
    explanation: "Đoạn E nói về lợi ích xã hội — căng thẳng giảm, nơi gặp gỡ cộng đồng.",
    paragraph: "E",
    evidence: "Studies … have linked regular gardening with lower reported stress.",
  },
  {
    num: 4,
    type: "matching-headings",
    stem: "Paragraph G",
    options: HEADINGS,
    letters: ROMAN,
    correct: "vi",
    explanation: "Đoạn G nói về nguy cơ nhiễm chì và quy định an toàn của thành phố.",
    paragraph: "G",
    evidence: "Soil in long-built-up areas may contain lead … some cities now insist on soil testing.",
  },
  {
    num: 5,
    type: "true-false-not-given",
    stem: "City food programmes were promoted by governments during wartime.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correct: "A",
    explanation: "Đoạn B nhắc tới 'victory gardens' trong hai cuộc thế chiến → TRUE.",
    paragraph: "B",
    evidence: "During the two world wars, governments … urged citizens to plant 'victory gardens'.",
  },
  {
    num: 6,
    type: "true-false-not-given",
    stem: "Every rooftop in a city is suitable for a vegetable garden.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correct: "B",
    explanation: "Đoạn C nói nhà cũ thường không chịu được trọng lượng → khẳng định 'mọi sân thượng' là sai → FALSE.",
    paragraph: "C",
    evidence: "older buildings often cannot support it without expensive reinforcement.",
    vocab: ["reinforcement (n): gia cố"],
  },
  {
    num: 7,
    type: "true-false-not-given",
    stem: "Urban farming has lowered food prices in supermarkets.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correct: "C",
    explanation: "Bài không nhắc tới giá siêu thị → NOT GIVEN.",
    evidence: "No paragraph in the passage discusses supermarket food prices.",
  },
  {
    num: 8,
    type: "matching-paragraph-information",
    stem: "a comparison of the productivity of soilless systems",
    correct: "D",
    explanation: "Đoạn D so sánh sản lượng mỗi mét vuông với đồng ruộng mở.",
    paragraph: "D",
    evidence: "Yields per square metre may be several times higher than in open fields.",
  },
  {
    num: 9,
    type: "matching-paragraph-information",
    stem: "a reference to the psychological value of gardening",
    correct: "E",
    explanation: "Đoạn E nói về giảm căng thẳng (psychological).",
    paragraph: "E",
    evidence: "linked regular gardening with lower reported stress",
    vocab: ["stress (n): căng thẳng"],
  },
  {
    num: 10,
    type: "matching-paragraph-information",
    stem: "a warning about polluted urban soil",
    correct: "G",
    explanation: "Đoạn G cảnh báo đất nhiễm chì từ hoạt động công nghiệp cũ.",
    paragraph: "G",
    evidence: "Soil … may contain lead from former petrol, paint or industrial works.",
  },
  {
    num: 11,
    type: "sentence-completion",
    stem: "Modern soilless farms can be installed in ______.",
    correct: "shipping containers",
    explanation: "Đoạn D: hệ thống có thể đặt trong thùng container bỏ đi.",
    paragraph: "D",
    evidence: "both can produce crops in shipping containers or disused car parks.",
    vocab: ["disused (adj): bị bỏ hoang, không dùng nữa"],
  },
  {
    num: 12,
    type: "sentence-completion",
    stem: "During the wars, families were asked to grow vegetables in ______.",
    correct: "back gardens",
    explanation: "Đoạn B: chính phủ khuyến khích trồng trong vườn sau nhà.",
    paragraph: "B",
    evidence: "urged citizens to plant 'victory gardens' in back gardens and public parks",
  },
  {
    num: 13,
    type: "sentence-completion",
    stem: "Some growers sell produce directly through ______.",
    correct: "farm shops/farm shop",
    explanation: "Đoạn F: bán trực tiếp qua farm shop và chợ hàng tuần.",
    paragraph: "F",
    evidence: "Where the food is sold directly through farm shops and weekly markets",
    vocab: ["produce (n): nông sản"],
  },
];

/* ================================================================== *
 * PASSAGE 2 — The Science of Sleep (54–67)
 * ================================================================== */

const PASSAGE2: ReadingPassage = {
  passage: 2,
  title: "The Science of Sleep",
  topic: "Health · Neuroscience",
  paragraphs: [
    {
      label: "A",
      text: "For most of the twentieth century, sleep was treated as a passive state, a daily switch-off during which little of interest occurred. Neuroscientists now describe it differently. While the body rests, the brain remains strikingly busy: it replays the day's experiences, discards unhelpful material and consolidates what matters into long-term memory.",
    },
    {
      label: "B",
      text: "A night of sleep repeats in cycles of roughly ninety minutes. Early cycles are rich in slow-wave sleep, in which large, synchronized electrical waves sweep across the cortex. Later cycles contain more REM, or rapid eye movement sleep, during which the brain is nearly as active as it is when a person is awake and most dreaming takes place.",
    },
    {
      label: "C",
      text: "The function of REM sleep has attracted particular debate. One influential proposal is that emotional memories are reprocessed during REM and stripped of some of their sharpness, which may explain why a difficult event often feels less raw after a full night's rest. Attempts to prove this directly in humans, however, have produced mixed results.",
    },
    {
      label: "D",
      text: "Sleep pressure builds through the day. A molecule called adenosine accumulates in the brain the longer a person stays awake, and caffeine works largely by blocking its receptors rather than by adding energy. After a night of poor sleep, adenosine is cleared quickly, so the next morning may feel normal — until the following afternoon, when the debt reappears.",
    },
    {
      label: "E",
      text: "Industrial societies have quietly run a large experiment in sleep restriction. Shift workers, students and parents of newborns routinely obtain six hours or fewer. Laboratory studies consistently show that such people become poorer at sustained attention, while believing — wrongly — that they have adapted to the shorter schedule.",
    },
    {
      label: "F",
      text: "Teenagers are a special case. Their internal clocks shift later at puberty, so an eight o'clock school start repeatedly cuts the final, REM-rich hours of the night. Where districts have delayed the first bell, attendance has improved and road accidents among young drivers have fallen, though parents report greater difficulty with morning routines.",
    },
    {
      label: "G",
      text: "Cheap monitoring has turned sleep into a hobby for many. Wrist devices estimate sleep from movement and heart rate, and their marketing promises insight that a lab could once only provide. Comparisons show that consumer trackers are reasonably good at telling when a person sleeps, but considerably weaker at correctly naming the stage.",
    },
    {
      label: "H",
      text: "Clinicians hope the next decade will be more careful. Rather than chasing a single perfect number of hours, researchers increasingly talk about sleep regularity — going to bed and waking at similar times — as a practical target, alongside treating disorders such as apnoea, which are common, disruptive and, in most cases, manageable.",
    },
  ],
  table: {
    caption: "Typical structure of adult sleep (demo data)",
    headers: ["Stage", "Share of the night", "Main characteristic"],
    rows: [
      ["Light sleep", "about 50%", "Heart rate and breathing slow"],
      ["Slow-wave sleep", "about 20%", "Large synchronized brain waves"],
      ["REM sleep", "about 25%", "Vivid dreaming; brain nearly awake"],
      ["Awake time", "about 5%", "Brief natural awakenings"],
    ],
  },
  footnote: "Adapted academic text for IELTS practice — demo content.",
};

const PASSAGE2_QUESTIONS: Seed[] = [
  {
    num: 1,
    type: "multiple-choice",
    stem: "What is the main point of the first paragraph?",
    options: [
      "Sleep is a period of complete inactivity",
      "The brain is active during sleep in useful ways",
      "Dreaming has no effect on memory",
      "Neuroscience has abandoned the study of sleep",
    ],
    correct: "B",
    explanation: "Mở đầu khẳng định não vẫn hoạt động có ích trong khi ngủ.",
    paragraph: "A",
    evidence: "the brain remains strikingly busy: it replays the day's experiences … and consolidates what matters.",
  },
  {
    num: 2,
    type: "multiple-choice",
    stem: "According to paragraph B, REM sleep is characterized by",
    options: [
      "slow, synchronized electrical waves",
      "the longest phase of each cycle",
      "high brain activity and dreaming",
      "a drop in body temperature",
    ],
    correct: "C",
    explanation: "REM: não hoạt động gần như khi thức và chủ yếu mơ.",
    paragraph: "B",
    evidence: "the brain is nearly as active as it is when a person is awake and most dreaming takes place.",
    vocab: ["rapid eye movement (n): giấc ngủ mắt chuyển động nhanh"],
  },
  {
    num: 3,
    type: "multiple-choice",
    stem: "What does caffeine mainly do?",
    options: [
      "It adds energy to the body",
      "It blocks the receptors of adenosine",
      "It removes adenosine from the brain",
      "It shortens each sleep cycle",
    ],
    correct: "B",
    explanation: "Caffeine ngăn adenosine gắn vào thụ thể chứ không tạo năng lượng.",
    paragraph: "D",
    evidence: "caffeine works largely by blocking its receptors rather than by adding energy",
    vocab: ["receptor (n): thụ thể"],
  },
  {
    num: 4,
    type: "yes-no-not-given",
    stem: "The writer says that REM sleep definitely explains why emotions settle after rest.",
    options: ["YES", "NO", "NOT GIVEN"],
    correct: "B",
    explanation: "Tác giả nói kết quả thử nghiệm 'mixed' — không khẳng định → NO.",
    paragraph: "C",
    evidence: "Attempts to prove this directly in humans, however, have produced mixed results.",
  },
  {
    num: 5,
    type: "yes-no-not-given",
    stem: "Shift workers usually notice their own decline in attention.",
    options: ["YES", "NO", "NOT GIVEN"],
    correct: "B",
    explanation: "Họ tin rằng mình đã quen — tin sai → NO.",
    paragraph: "E",
    evidence: "believing — wrongly — that they have adapted to the shorter schedule.",
  },
  {
    num: 6,
    type: "yes-no-not-given",
    stem: "Wrist devices are more accurate than laboratory equipment.",
    options: ["YES", "NO", "NOT GIVEN"],
    correct: "C",
    explanation: "Bài chỉ nói thiết bị đeo xác định được thời điểm ngủ nhưng kém giai đoạn — không so sánh chính xác hơn lab → NOT GIVEN.",
    paragraph: "G",
    evidence: "consumer trackers are reasonably good at telling when a person sleeps, but considerably weaker at naming the stage.",
  },
  {
    num: 7,
    type: "summary-completion",
    stem: "Summary of paragraphs A–B",
    instruction: "Complete the summary. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.",
    correct: "ninety",
    explanation: "Chu kỳ giấc ngủ lặp lại sau khoảng 90 phút.",
    paragraph: "B",
    evidence: "A night of sleep repeats in cycles of roughly ninety minutes.",
  },
  {
    num: 8,
    type: "summary-completion",
    stem: "Summary of paragraphs A–B — the body rests while the ______ replays experiences",
    correct: "brain",
    explanation: "Não lặp lại trải nghiệm trong ngày để ghi nhớ.",
    paragraph: "A",
    evidence: "While the body rests, the brain remains strikingly busy: it replays the day's experiences.",
  },
  {
    num: 9,
    type: "summary-completion",
    stem: "Summary of paragraphs A–B — REM is also called rapid ______ sleep",
    correct: "eye movement",
    explanation: "REM = rapid eye movement sleep.",
    paragraph: "B",
    evidence: "REM, or rapid eye movement sleep",
  },
  {
    num: 10,
    type: "note-completion",
    stem: "Sleep pressure: ______ accumulates while a person stays awake",
    correct: "adenosine",
    explanation: "Adenosine tích tụ khi thức lâu → gây buồn ngủ.",
    paragraph: "D",
    evidence: "A molecule called adenosine accumulates in the brain the longer a person stays awake.",
    vocab: ["adenosine (n): adenosine (chất gây buồn ngủ)"],
  },
  {
    num: 11,
    type: "note-completion",
    stem: "Sleep pressure: it is cleared quickly after a night of poor sleep, so tiredness returns the next ______",
    correct: "afternoon/next afternoon",
    explanation: "Nợ giấc ngủ quay lại vào buổi chiều hôm sau.",
    paragraph: "D",
    evidence: "until the following afternoon, when the debt reappears.",
  },
  {
    num: 12,
    type: "table-completion",
    stem: "Which stage takes about 50% of the night?",
    correct: "light sleep",
    explanation: "Bảng: Light sleep chiếm khoảng 50%.",
    paragraph: "B",
    evidence: "Light sleep — about 50%.",
  },
  {
    num: 13,
    type: "table-completion",
    stem: "Which stage is marked by large synchronized brain waves?",
    correct: "slow-wave sleep",
    explanation: "Bảng: Slow-wave sleep — sóng não lớn đồng bộ.",
    paragraph: "B",
    evidence: "Slow-wave sleep — about 20% — large synchronized brain waves.",
    vocab: ["synchronized (adj): đồng bộ"],
  },
  {
    num: 14,
    type: "table-completion",
    stem: "Roughly what share of the night is spent dreaming in REM?",
    instruction: "Write NO MORE THAN ONE WORD AND/OR A NUMBER.",
    correct: "about 25%/25%",
    explanation: "Bảng: REM sleep khoảng 25%.",
    paragraph: "B",
    evidence: "REM sleep — about 25%.",
  },
];

/* ================================================================== *
 * PASSAGE 3 — Restoring the Venice Lagoon (68–80)
 * ================================================================== */

const PASSAGE3: ReadingPassage = {
  passage: 3,
  title: "Restoring the Venice Lagoon",
  topic: "Engineering · Environment · Heritage",
  paragraphs: [
    {
      label: "A",
      text: "Venice sits inside a lagoon rather than on the open sea, and for centuries that lagoon protected it. Tidal flats and salt marshes absorbed storm energy, while channels carried away the sand that the Adriatic tried to push inland. From the nineteenth century onwards, dredging for industrial harbours and the sinking of the mainland steadily weakened these natural defences.",
    },
    {
      label: "B",
      text: "The problem has two faces. Floods arrive from the sea when low pressure and south-easterly winds pile water into the lagoon; they also arrive from within, when heavy rain and river overflow raise levels behind the city. On the worst days the two coincide, and water enters St Mark's Square through drains as well as across its edges.",
    },
    {
      label: "C",
      text: "The most ambitious answer was a system of mobile barriers. Seventy-eight hollow steel gates stand in rows at the three lagoon inlets; when a surge is forecast, compressed air drives them upwards until they rise from the seabed and separate the lagoon from the Adriatic. The gates are lowered again within hours, so shipping and tidal exchange are only briefly interrupted.",
    },
    {
      label: "D",
      text: "Engineers emphasize that barriers treat the symptom. Salt water pushed up through the soil corrodes foundations, and brick churches that stood above damp for five centuries are now absorbing brine through their lower walls. Conservation teams have fitted monitoring sensors and are testing lime-based injections that draw crystallized salt back out of the masonry.",
    },
    {
      label: "E",
      text: "Land reclamation made matters worse in a second way. When the industrial city of Marghera was built, lagoon bed was removed and canals were deepened for ships, which widened the inlets and let larger tides enter. Modelling shows that every additional centimetre of mean water level markedly increases the number of hours each year that the city floods.",
    },
    {
      label: "F",
      text: "Nature-based work has therefore returned to fashion. Projects have re-profiled abandoned salt pans into marsh, replanted sea grass on shallow flats and rebuilt islands of dredged sediment to slow currents. Early monitoring suggests wave energy falling by a fifth across restored flats, although ecologists caution that young marshes need a decade before they fully protect the shoreline.",
    },
    {
      label: "G",
      text: "Money is never scarce for a headline project, but it is scarce for maintenance. Venetians have also grown wary of measures decided elsewhere: protests followed proposals to charge day visitors by season, and fishing communities objected to limits imposed on lagoon channels. Any plan that ignores these social reactions, planners admit, tends to fail quietly.",
    },
    {
      label: "H",
      text: "The barriers were switched on in 2020 and have since been raised for dozens of surges without a major flood in the city. Yet officials now speak of a portfolio rather than a single fix: gates where the sea attacks, marsh where the wind builds water, stricter rules for foundations and patient repair of the brickwork beneath. The lagoon, in their view, must be worked with rather than held back.",
    },
  ],
  figure: {
    kind: "flowchart",
    caption: "Mobile barrier operation — sequence (demo diagram placeholder)",
  },
  footnote: "Adapted academic text for IELTS practice — demo content.",
};

const RESEARCHERS = ["Dr Bassani", "Prof. Conti", "Dr Duarte", "Ms Fitzgerald"];
const FEATURES = [
  "study of salt damage to brickwork",
  "modelling of tidal flow through the inlets",
  "monitoring of wave energy on restored marsh",
  "survey of public opinion on visitor charges",
];
const ENDINGS = [
  "and has raised public resistance to new rules",
  "which are cheaper than mechanical structures",
  "so it only delays the flooding",
  "while the tides can pass freely beneath",
  "because they were built for heavier ships",
  "where salt water rises through the soil",
];

const PASSAGE3_QUESTIONS: Seed[] = [
  {
    num: 1,
    type: "matching-sentence-endings",
    stem: "The mobile barriers rise from the seabed ______",
    options: ENDINGS,
    correct: "D",
    explanation: "Cổng chìm dưới đáy và chỉ nhô lên khi có dự báo — thủy triều vẫn đi qua bên dưới khi hạ.",
    paragraph: "C",
    evidence: "compressed air drives them upwards until they rise from the seabed … The gates are lowered again within hours.",
  },
  {
    num: 2,
    type: "matching-sentence-endings",
    stem: "Salt water rising through the soil damages buildings ______",
    options: ENDINGS,
    correct: "F",
    explanation: "Muối xâm nhập qua nền: 'where salt water rises through the soil'.",
    paragraph: "D",
    evidence: "Salt water pushed up through the soil corrodes foundations.",
    vocab: ["corrode (v): ăn mòn"],
  },
  {
    num: 3,
    type: "matching-features",
    stem: "Who modelled how tides move through the inlets?",
    options: FEATURES,
    correct: "B",
    explanation: "Phần E nói về mô hình hóa thủy triều qua cửa đầm phá.",
    paragraph: "E",
    evidence: "Modelling shows that every additional centimetre of mean water level …",
  },
  {
    num: 4,
    type: "matching-features",
    stem: "Whose work measures the effect of new marsh on waves?",
    options: FEATURES,
    correct: "C",
    explanation: "Đoạn F: giám sát năng lượng sóng trên đầm lầy phục hồi.",
    paragraph: "F",
    evidence: "Early monitoring suggests wave energy falling by a fifth across restored flats.",
  },
  {
    num: 5,
    type: "matching-names",
    stem: "Who warns that young marshes need about ten years to work properly?",
    options: RESEARCHERS,
    correct: "C",
    explanation: "Quan điểm của chuyên gia được trích dẫn trong đoạn F (Duarte).",
    paragraph: "F",
    evidence: "ecologists caution that young marshes need a decade before they fully protect the shoreline.",
  },
  {
    num: 6,
    type: "matching-names",
    stem: "Who describes the need to repair the lower church walls?",
    options: RESEARCHERS,
    correct: "B",
    explanation: "Đoạn D nói về đội bảo tồn thay thế — gắn với Conti.",
    paragraph: "D",
    evidence: "Conservation teams … are testing lime-based injections.",
  },
  {
    num: 7,
    type: "multiple-answer",
    stem: "Which TWO causes of flooding are described in paragraph B?",
    options: [
      "Storm surges from the open sea",
      "Sinking of the church foundations",
      "Rain and river overflow from inland",
      "Tourist boats in the canals",
      "Dredging of the shipping channels",
    ],
    correct: "A,C",
    explanation: "Đoạn B nêu hai nguồn: surge từ biển và mưa + sông tràn từ bên trong.",
    paragraph: "B",
    evidence: "Floods arrive from the sea … they also arrive from within, when heavy rain and river overflow raise levels.",
  },
  {
    num: 8,
    type: "multiple-answer",
    stem: "Which TWO measures are mentioned as still being developed or tested?",
    options: [
      "Lime-based injections into masonry",
      "Charging visitors by season",
      "Sea grass planting on shallow flats",
      "Raising the mobile barriers",
      "Deepening the industrial canals",
    ],
    correct: "A,C",
    explanation: "Tiêm vôi (đoạn D) và trồng cỏ biển (đoạn F) đang được thử nghiệm/monitoring.",
    paragraph: "D",
    evidence: "testing lime-based injections …; replanted sea grass on shallow flats",
  },
  {
    num: 9,
    type: "short-answer",
    stem: "How many steel gates make up the mobile barrier system?",
    instruction: "Write ONE NUMBER.",
    correct: "78/seventy-eight",
    explanation: "Đoạn C: 78 cổng thép rỗng.",
    paragraph: "C",
    evidence: "Seventy-eight hollow steel gates stand in rows at the three lagoon inlets.",
  },
  {
    num: 10,
    type: "short-answer",
    stem: "What material were the city's churches mainly built with?",
    instruction: "Write ONE WORD.",
    correct: "brick",
    explanation: "Đoạn D: nhà thờ gạch (brick churches).",
    paragraph: "D",
    evidence: "brick churches that stood above damp for five centuries",
  },
  {
    num: 11,
    type: "short-answer",
    stem: "In what year were the barriers first put into operation?",
    instruction: "Write ONE NUMBER.",
    correct: "2020",
    explanation: "Đoạn H: cổng vận hành năm 2020.",
    paragraph: "H",
    evidence: "The barriers were switched on in 2020",
  },
  {
    num: 12,
    type: "diagram-label-completion",
    stem: "The gates are powered by ______, which drives them upwards",
    instruction: "Write NO MORE THAN TWO WORDS.",
    correct: "compressed air",
    explanation: "Đoạn C: không khí nén đẩy cổng lên.",
    paragraph: "C",
    evidence: "compressed air drives them upwards until they rise from the seabed",
    vocab: ["compressed air: không khí nén"],
  },
  {
    num: 13,
    type: "flowchart-completion",
    stem: "Final step of the barrier cycle — the gates are ______ again after the surge passes",
    instruction: "Write ONE WORD.",
    correct: "lowered",
    explanation: "Bước cuối: cổng được hạ trở lại trong vài giờ.",
    paragraph: "C",
    evidence: "The gates are lowered again within hours",
  },
];

const PASSAGE_SEEDS: Array<{
  passage: 1 | 2 | 3;
  data: ReadingPassage;
  seeds: Seed[];
}> = [
  { passage: 1, data: PASSAGE1, seeds: PASSAGE1_QUESTIONS },
  { passage: 2, data: PASSAGE2, seeds: PASSAGE2_QUESTIONS },
  { passage: 3, data: PASSAGE3, seeds: PASSAGE3_QUESTIONS },
];

let cachedPassages: ReadingPassageData[] | null = null;

/** All three reading passages with questions. */
export function getReadingPassages(): ReadingPassageData[] {
  if (!cachedPassages) {
    cachedPassages = PASSAGE_SEEDS.map((item) => ({
      config: READING_PASSAGES.find((p) => p.passage === item.passage) as ReadingPassageConfig,
      passage: item.data,
      questions: build(item.passage, item.seeds),
    }));
  }
  return cachedPassages;
}

/** Flat list of the 40 reading questions (id 41–80, num 1–40). */
export function getReadingQuestions(): IeltsQuestion[] {
  return getReadingPassages().flatMap((p) => p.questions);
}
