/**
 * seed-content/ielts/reading.ts — IELTS Academic Reading (3 passages: 13/13/14 = 40).
 *
 * Task types preserved, mapped to FE-answerable types:
 *   Passage 1  TFNG (3, MC) + matching headings (5, MC) + sentence completion (5, FILL_BLANK)
 *   Passage 2  MC (3) + matching information (6, MC) + summary completion (4, FILL_BLANK)
 *   Passage 3  YNNG (3, MC) + diagram labels (3, FILL_BLANK) + matching features (5, MC)
 *              + short answer (3, SHORT_ANSWER)
 */
import { SeedGroup, SeedQuestion, mc, note, openTask } from '../types';
import { expectCount } from '../validate';

/* ============================== PASSAGE 1 ============================= */

const P1_TEXT = `URBAN FORESTS: PLANTING FOR A COOLER CITY

A. On a summer afternoon the air above a city street can be ten degrees hotter than the air in a park only a few hundred metres away. Concrete, asphalt and dark roofs absorb sunlight during the day and release it slowly at night, a pattern scientists call the urban heat island effect. The effect is not new, but it is growing as cities spread and summers lengthen.

B. One of the simplest responses is also one of the oldest: planting trees. A mature tree can intercept thousands of litres of rainwater with its crown and shade surfaces that would otherwise store heat. In a study of eleven European cities, researchers found that street trees lowered nearby surface temperatures by an average of six degrees. Trees also release water vapour through their leaves, a process that cools the surrounding air much like sweating cools the body.

C. The benefits are not only physical. Surveys in several countries report that people walk more often in tree-lined neighbourhoods, and patients in hospitals with views of trees recover, on average, a day sooner. Property values rise as well: a single large oak in front of a house can add several thousand dollars to its price, according to American studies.

D. Yet trees are not a quick fix. A young sapling provides less shade in its first decade than a wooden parasol, and cities that plant without planning often lose the trees within five years. Street trees compete with pipes, cables and pavements for space, and heat-loving species such as palms offer almost no shade. In Phoenix, Arizona, officials once planted thousands of trees that later had to be removed because their roots damaged the water system.

E. Timing matters as much as species. Researchers in Melbourne modelled two scenarios: planting mainly in spring, or spreading plantings across the whole year. Trees planted outside the hottest months established root systems more quickly and survived at rates twenty per cent higher. The lesson, the authors write, is that a tree planted at the right moment is worth three planted at the wrong one.

F. Some cities now treat their canopies as infrastructure, the same way they treat drains and power lines. Chicago measures its tree cover from the air every five years and sets a target for growth; Singapore requires developers to replace every tree they remove. None of these policies can lower a city's temperature overnight, but together they suggest that the greenest cities of the future will be the ones that planned earliest.`;

const P1_QUESTIONS: SeedQuestion[] = [
  /* ---- TFNG (3) ---- */
  mc(
    'City surfaces such as concrete release the heat they stored during the day at night.',
    ['True', 'False', 'Not Given'],
    0,
    note(
      'Đoạn A: surfaces "absorb sunlight during the day and release it slowly at night" → phát biểu ĐÚNG với bài đọc.',
      'heat island effect (n) — hiệu ứng đảo nhiệt',
      'Dễ',
    ),
  ),
  mc(
    'Street trees reduced surface temperatures by exactly six degrees in every one of the eleven cities studied.',
    ['True', 'False', 'Not Given'],
    1,
    note(
      'Đoạn B: sáu độ là mức TRUNG BÌNH của 11 thành phố, không phải "exactly … in every city" → sai (False).',
      'average (n) — mức trung bình',
      'Trung cấp',
    ),
  ),
  mc(
    'The research on the benefits of urban trees was funded by city governments.',
    ['True', 'False', 'Not Given'],
    2,
    note(
      'Bài đọc không nhắc tới nguồn tài trợ nào → Not Given (không xác nhận, không phủ định).',
      'fund (v) — tài trợ',
      'Trung cấp',
    ),
  ),
  /* ---- Matching headings (5) ---- */
  mc(
    'Choose the correct heading for paragraph B.',
    [
      'iii. Evidence that trees cool the air',
      'i. The wider effects of leafy streets on people and prices',
      'vi. A history of city planning since 1900',
      'vii. The cost of air conditioning in hot climates',
    ],
    0,
    note(
      'Đoạn B toàn số liệu làm mát: 11 thành phố, giảm 6 độ, thoát hơi nước → heading về "bằng chứng cây làm mát".',
      'intercept (v) — chặn, giữ lại',
      'Trung cấp',
    ),
  ),
  mc(
    'Choose the correct heading for paragraph C.',
    [
      'vi. A history of city planning since 1900',
      'iii. Evidence that trees cool the air',
      'i. The wider effects of leafy streets on people and prices',
      'iv. The best season to put a tree in the ground',
    ],
    2,
    note(
      'Đoạn C bàn tác động xa hơn: đi bộ nhiều hơn, bệnh nhân hồi phục nhanh, giá nhà tăng → "tác động rộng hơn".',
      'property value (n) — giá trị bất động sản',
      'Trung cấp',
    ),
  ),
  mc(
    'Choose the correct heading for paragraph D.',
    [
      'ii. Why planting the wrong trees can fail',
      'v. Treating tree cover as a public service',
      'vii. The cost of air conditioning in hot climates',
      'iii. Evidence that trees cool the air',
    ],
    0,
    note(
      'Đoạn D: sapling non, sai loài (cọ không che nắng), rễ hỏng hệ nước ở Phoenix → lý do thất bại khi trồng thiếu tính toán.',
      'quick fix (n) — giải pháp tức thì',
      'Trung cấp',
    ),
  ),
  mc(
    'Choose the correct heading for paragraph E.',
    [
      'iv. The best season to put a tree in the ground',
      'i. The wider effects of leafy streets on people and prices',
      'vi. A history of city planning since 1900',
      'ii. Why planting the wrong trees can fail',
    ],
    0,
    note(
      'Đoạn E xoay quanh THỜI ĐIỂM trồng (Melbourne, mùa không nắng nhất, sống cao hơn 20%) → heading về mùa trồng tốt nhất.',
      'scenario (n) — kịch bản',
      'Trung cấp',
    ),
  ),
  mc(
    'Choose the correct heading for paragraph F.',
    [
      'v. Treating tree cover as a public service',
      'iii. Evidence that trees cool the air',
      'vii. The cost of air conditioning in hot climates',
      'i. The wider effects of leafy streets on people and prices',
    ],
    0,
    note(
      'Đoạn F: Chicago đo canopy 5 năm/lần, Singapore bắt buộc trồng bù → quản lý cây như hạ tầng công cộng.',
      'canopy (n) — tán cây',
      'Khó',
    ),
  ),
  /* ---- Sentence completion (5) ---- */
  openTask(
    'FILL_BLANK',
    'According to the study of eleven European cities, street trees lowered nearby surface temperatures by an average of six ______. (NO MORE THAN TWO WORDS)',
    note(
      'Đoạn B: "lowered nearby surface temperatures by an average of six degrees" → degrees.',
      'surface temperature (n) — nhiệt độ bề mặt',
      'Dễ',
    ),
    ['degrees', 'degree'],
  ),
  openTask(
    'FILL_BLANK',
    'Trees release water ______ through their leaves, which cools the surrounding air. (NO MORE THAN TWO WORDS)',
    note(
      'Đoạn B: "Trees also release water vapour through their leaves" → vapour (khí, hơi).',
      'water vapour (n) — hơi nước',
      'Dễ',
    ),
    ['vapour', 'vapor'],
  ),
  openTask(
    'FILL_BLANK',
    'A single large ______ in front of a house can add several thousand dollars to its price. (ONE WORD)',
    note(
      'Đoạn C: "a single large oak in front of a house can add several thousand dollars" → oak.',
      'oak (n) — cây sồi',
      'Dễ',
    ),
    ['oak'],
  ),
  openTask(
    'FILL_BLANK',
    'In Phoenix, thousands of planted trees had to be removed because their ______ damaged the water system. (ONE WORD)',
    note(
      'Đoạn D: "their roots damaged the water system" → roots.',
      'root (n) — rễ cây',
      'Dễ',
    ),
    ['roots', 'root'],
  ),
  openTask(
    'FILL_BLANK',
    'Chicago measures its tree ______ from the air every five years. (ONE WORD)',
    note(
      'Đoạn F: "Chicago measures its tree cover from the air every five years" → cover (tán/độ che phủ).',
      'tree cover (n) — độ che phủ cây xanh',
      'Trung cấp',
    ),
    ['cover'],
  ),
];

/* ============================== PASSAGE 2 ============================= */

const P2_TEXT = `BEFORE COLUMBUS: THE NORSEMEN IN NORTH AMERICA

A. In the sagas written down in Iceland some two centuries after the events, a sailor called Bjarni Herjolfsson is credited with the first European sighting of North America. Blown off course on his way from Norway to Greenland around the year 986, he saw forests and low beaches but never went ashore, and his report became campfire knowledge among the Norse settlers.

B. Around the year 1000, Leif Erikson, son of Erik the Red, bought Bjarni's ship and sailed west. He found three kinds of country: a stony shore he called Helluland, a flat wooded land he called Markland, and a region of meadows where the days were so long that settlers could still cut grass after supper. Modern scholars usually identify the three with Baffin Island, Labrador and Newfoundland.

C. The base at L'Anse aux Meadows, excavated in the 1960s, confirmed parts of the stories. The ruins of eight buildings stood close together near the shore, and radiocarbon dating placed them around the year 1021. A bronze cloak pin of Norwegian style lay in one doorway, while butternuts stored in a shed showed that the inhabitants sailed south to gather food, because butternuts do not grow that far north.

D. The Norse presence was short. The sagas record quarrels with the people they called Skraelings — the ancestors of today's Inuit and First Nations — and the camp was abandoned within a few decades. Timber and furs, the two reasons for going, could be obtained by trading with coastal groups rather than by defending a settlement.

E. Why did the attempt fail? Historians point to numbers. A Greenland crew could muster perhaps a hundred fighting men, while the population they met along the Gulf of St. Lawrence numbered in the thousands. At the same time the climate was turning colder, and the Little Ice Age was beginning to grip the North Atlantic, making the short supply line from Greenland ever riskier.

F. Columbus, sailing in 1492, never knew of the earlier voyages, and the difference in their consequences was not only one of luck. The Norse arrivals were recorded only in oral tales that were written down generations later; Columbus's voyages were described by their participants, financed by a crown, repeated within his lifetime, and followed by permanent colonies.

G. The map in school textbooks still begins with 1492. Yet the stones at L'Anse aux Meadows show that Europeans had reached the Americas four centuries earlier — and, unlike 1492, they came, saw, and left almost without a trace.`;

const P2_QUESTIONS: SeedQuestion[] = [
  /* ---- General MCQ (3) ---- */
  mc(
    "What is the main purpose of the passage?",
    [
      'To prove that Icelandic settlers colonised North America permanently',
      'To present the evidence that Europeans reached the Americas before Columbus',
      'To explain why Columbus failed to reach Asia',
      'To describe the daily life of the Inuit and First Nations',
    ],
    1,
    note(
      'Toàn văn đưa bằng chứng (saga, L\'Anse aux Meadows, 1021) rồi kết "reached the Americas four centuries earlier" → mục đích: người Âu đến trước Columbus.',
      'evidence (n) — bằng chứng',
      'Trung cấp',
    ),
  ),
  mc(
    'Why does the author mention the bronze cloak pin found in the ruins?',
    [
      'To show that the inhabitants traded with Norway',
      'To date the buildings precisely to 1021',
      'To suggest the people who built the base came from Norway',
      'To prove that butternuts were imported from Europe',
    ],
    2,
    note(
      'Đoạn C: "A bronze cloak pin of Norwegian style" — vật kiểu Na Uy = dấu hiệu người ở đây đến từ Na Uy (không nói tới "thương mại").',
      'cloak pin (n) — trâm áo choàng',
      'Trung cấp',
    ),
  ),
  mc(
    'How does the author describe the end of the Norse settlement?',
    [
      'It ended suddenly after a single battle.',
      'It lasted only briefly and left very little physical trace.',
      'It grew into a permanent colony in Newfoundland.',
      'It was ended by a change in the fur trade.',
    ],
    1,
    note(
      'Đoạn D-G: "short", "abandoned within a few decades", "left almost without a trace" → ngắn ngủi, để lại rất ít dấu vết.',
      'physical trace (n) — dấu vết vật chất',
      'Trung cấp',
    ),
  ),
  /* ---- Matching information (6) ---- */
  mc(
    'In which paragraph is Bjarni Herjolfsson\'s decision not to go ashore described?',
    ['Paragraph A', 'Paragraph B', 'Paragraph D', 'Paragraph F'],
    0,
    note(
      'Đoạn A: Bjarni "saw forests and low beaches but never went ashore".',
      'go ashore (v) — lên bờ',
      'Dễ',
    ),
  ),
  mc(
    'In which paragraph are Leif Erikson\'s names for the new regions given?',
    ['Paragraph C', 'Paragraph B', 'Paragraph E', 'Paragraph G'],
    1,
    note(
      'Đoạn B: Helluland, Markland và vùng đồng cỏ — tên do Leif Erikson đặt.',
      'region (n) — khu vực',
      'Dễ',
    ),
  ),
  mc(
    'In which paragraph is the discovery of butternuts in a shed mentioned?',
    ['Paragraph D', 'Paragraph A', 'Paragraph C', 'Paragraph F'],
    2,
    note(
      'Đoạn C: "butternuts stored in a shed showed that the inhabitants sailed south".',
      'butternut (n) — óc chó mỡ',
      'Trung cấp',
    ),
  ),
  mc(
    'In which paragraph is the reason for abandoning the camp explained?',
    ['Paragraph E', 'Paragraph D', 'Paragraph C', 'Paragraph G'],
    1,
    note(
      'Đoạn D: tranh chấp với Skraelings + có thể đổi lấy gỗ/lông thú qua thương mại → bỏ trại.',
      'abandon (v) — bỏ rơi',
      'Trung cấp',
    ),
  ),
  mc(
    'In which paragraph is the Norse\'s small numbers compared with the local population?',
    ['Paragraph B', 'Paragraph F', 'Paragraph D', 'Paragraph E'],
    3,
    note(
      'Đoạn E: thủy thủ Greenland ~100 người so với dân số "in the thousands" dọc vịnh St. Lawrence.',
      'muster (v) — tập hợp, huy động',
      'Trung cấp',
    ),
  ),
  mc(
    'In which paragraph are the Norse voyages compared with Columbus\'s voyages?',
    ['Paragraph F', 'Paragraph A', 'Paragraph C', 'Paragraph E'],
    0,
    note(
      'Đoạn F: ghi chép bằng miệng vs. được tài trợ, lặp lại, dẫn tới thuộc địa lâu dài.',
      'consequence (n) — hệ quả',
      'Trung cấp',
    ),
  ),
  /* ---- Summary completion (4) ---- */
  openTask(
    'FILL_BLANK',
    'Complete the summary: Leif Erikson called the stony shore he found ______. (ONE WORD)',
    note(
      'Đoạn B: "a stony shore he called Helluland" → Helluland.',
      'stony (adj) — đầy sỏi đá',
      'Dễ',
    ),
    ['Helluland'],
  ),
  openTask(
    'FILL_BLANK',
    'Complete the summary: The ruins at L\'Anse aux Meadows were ______ in the 1960s. (ONE WORD)',
    note(
      'Đoạn C: "The base …, excavated in the 1960s, confirmed parts of the stories" → excavated (khai quật).',
      'excavate (v) — khai quật',
      'Trung cấp',
    ),
    ['excavated'],
  ),
  openTask(
    'FILL_BLANK',
    'Complete the summary: Timber and ______ were the two main reasons the Norse sailed west. (ONE WORD)',
    note(
      'Đoạn D: "Timber and furs, the two reasons for going" → furs (lông thú).',
      'fur (n) — lông thú',
      'Dễ',
    ),
    ['furs', 'fur'],
  ),
  openTask(
    'FILL_BLANK',
    'Complete the summary: The sagas were written down in ______ some two centuries after the events. (ONE WORD)',
    note(
      'Đoạn A: "written down in Iceland some two centuries after the events" → Iceland.',
      'saga (n) — chuyện cổ tích Bắc Âu, sử thi',
      'Trung cấp',
    ),
    ['Iceland'],
  ),
];

/* ============================== PASSAGE 3 ============================= */

const P3_TEXT = `WHY BAD HABITS ARE SO HARD TO BREAK

A. A habit is any behaviour that has become automatic through repetition. Psychologists distinguish between goal-directed actions, which we think about before doing, and habitual responses, which start on their own. When a habit forms, brain activity shifts: scans show that the prefrontal cortex — the seat of decision-making — goes quiet, while the basal ganglia take over. Performing a familiar action therefore costs the brain less energy than learning a new one.

B. The researcher Charles Duhigg describes the habit loop as three parts: a CUE triggers the behaviour, the ROUTINE is the behaviour itself, and the REWARD is the benefit the brain learns to expect. Over time the cue alone produces a craving for the reward, which is why seeing a biscuit tin on the counter can make someone reach for a biscuit even when they are not hungry.

C. Not all habits are equal. Brushing your teeth takes seconds and rarely fails; the difficult ones involve anything the brain treats as survival-critical. Food, social approval and novelty are managed by older brain systems. In a classic experiment, rats that expected a sugary pellet pressed the lever faster and faster — it was the anticipation of the reward, not the sugar itself, that drove the speed.

D. Substitution works better than suppression. Told not to think about a white bear, volunteers report the thought within seconds — Wegner's famous study. Likewise, telling a smoker to "just stop" leaves the cue and the craving untouched. Researchers therefore recommend keeping the cue and the reward but changing the routine: when the afternoon slump arrives, take a short walk instead of a cigarette, so that the break and the reset still deliver the reward.

E. Context can do what willpower cannot. Students who revised in the same room where they would sit the exam remembered more than those who revised elsewhere, and adults who kept one "keystone habit" — a daily walk, for instance — often found other healthy behaviours following without being told to change.

F. The idea that habits take 21 days to change is a myth. A study at University College London found that a new behaviour took anything from 18 to 254 days to feel automatic, with an average of 66 days. The old slogan, the researchers note, was invented by a plastic surgeon who was describing how long his patients took to get used to their new faces.`;

const P3_QUESTIONS: SeedQuestion[] = [
  /* ---- Yes / No / Not Given (3) ---- */
  mc(
    'The writer suggests that people overestimate how quickly a new behaviour becomes automatic.',
    ['Yes', 'No', 'Not Given'],
    0,
    note(
      'Đoạn F: "21 days is a myth", thực tế 18-254 ngày (trung bình 66) → tác giả ĐỒNG QUAN ĐIỂM (Yes).',
      'automatic (adj) — tự động, bản năng',
      'Trung cấp',
    ),
  ),
  mc(
    'The writer believes that suppressing a craving is more effective than replacing the routine.',
    ['Yes', 'No', 'Not Given'],
    1,
    note(
      'Đoạn D: "Substitution works better than suppression" → tác giả KHÔNG đồng ý (No).',
      'suppression (n) — sự kìm nén',
      'Trung cấp',
    ),
  ),
  mc(
    'The writer thinks that schools should teach children how habits form.',
    ['Yes', 'No', 'Not Given'],
    2,
    note(
      'Bài đọc không bàn về trường học hay chương trình giảng dạy → Not Given.',
      'curriculum (n) — chương trình giảng dạy',
      'Trung cấp',
    ),
  ),
  /* ---- Diagram labels (3) ---- */
  openTask(
    'FILL_BLANK',
    'Diagram label: In the habit loop diagram, the event that TRIGGERS the behaviour is called the ______. (ONE WORD)',
    note(
      'Đoạn B: "a CUE triggers the behaviour" → cue (mốc khởi động).',
      'cue (n) — tín hiệu kích hoạt',
      'Dễ',
    ),
    ['cue'],
  ),
  openTask(
    'FILL_BLANK',
    'Diagram label: In the habit loop diagram, the behaviour itself in the middle is called the ______. (ONE WORD)',
    note(
      'Đoạn B: "the ROUTINE is the behaviour itself" → routine (thói quen hành vi).',
      'routine (n) — hành vi lặp lại',
      'Dễ',
    ),
    ['routine'],
  ),
  openTask(
    'FILL_BLANK',
    'Diagram label: In the habit loop diagram, the benefit the brain learns to expect at the end is called the ______. (ONE WORD)',
    note(
      'Đoạn B: "the REWARD is the benefit the brain learns to expect" → reward (phần thưởng).',
      'reward (n) — phần thưởng',
      'Dễ',
    ),
    ['reward'],
  ),
  /* ---- Matching features (5) ---- */
  mc(
    'Who describes the three-part structure of a habit (cue, routine, reward)?',
    ['The plastic surgeon', 'Charles Duhigg', 'Wegner', 'University College London researchers'],
    1,
    note(
      'Đoạn B: "The researcher Charles Duhigg describes the habit loop as three parts".',
      'habit loop (n) — vòng lặp thói quen',
      'Dễ',
    ),
  ),
  mc(
    'Whose study shows that trying to suppress a thought makes it more persistent?',
    ['Wegner', 'Charles Duhigg', 'The rat experiment', 'University College London researchers'],
    0,
    note(
      'Đoạn D: "Told not to think about a white bear … — Wegner\'s famous study".',
      'persist (v) — tồn tại, dai dẳng',
      'Trung cấp',
    ),
  ),
  mc(
    'Which research found that a new behaviour took an average of 66 days to become automatic?',
    [
      'The rat experiment',
      'Wegner\'s white bear study',
      'A University College London study',
      'A plastic surgeon\'s observation',
    ],
    2,
    note(
      'Đoạn F: "A study at University College London found … an average of 66 days".',
      'take (v) — cần (thời gian)',
      'Dễ',
    ),
  ),
  mc(
    'Which experiment found that anticipation, not the reward itself, changed the speed of behaviour?',
    [
      'The rat experiment',
      'The white bear experiment',
      'The exam room study',
      'The keystone habit survey',
    ],
    0,
    note(
      'Đoạn C: "it was the anticipation of the reward, not the sugar itself, that drove the speed" (thí nghiệm với con chuột).',
      'anticipation (n) — sự mong đợi',
      'Khó',
    ),
  ),
  mc(
    'Who originally observed how long people take to get used to a new appearance?',
    ['A plastic surgeon', 'Charles Duhigg', 'Wegner', 'The Melbourne researchers'],
    0,
    note(
      'Đoạn F: slogan 21 ngày "was invented by a plastic surgeon … how long his patients took to get used to their new faces".',
      'get used to — làm quen với',
      'Trung cấp',
    ),
  ),
  /* ---- Short answer (3) ---- */
  openTask(
    'SHORT_ANSWER',
    'According to the University College London study, how many days did a new behaviour take to feel automatic ON AVERAGE? (NO MORE THAN THREE WORDS)',
    note(
      'Đoạn F: "an average of 66 days" → 66 / 66 days.',
      'on average — trung bình',
      'Dễ',
    ),
    ['66', '66 days'],
  ),
  openTask(
    'SHORT_ANSWER',
    'Which part of the brain takes over when a habit forms? (NO MORE THAN THREE WORDS)',
    note(
      'Đoạn A: "the prefrontal cortex … goes quiet, while the basal ganglia take over" → the basal ganglia.',
      'basal ganglia (n) — nhân đám đậu',
      'Trung cấp',
    ),
    ['basal ganglia', 'the basal ganglia'],
  ),
  openTask(
    'SHORT_ANSWER',
    'In Wegner\'s study, volunteers told not to think about a white bear reported thinking about it within what? (NO MORE THAN THREE WORDS)',
    note(
      'Đoạn D: "volunteers report the thought within seconds" → seconds.',
      'white bear (n) — gấu trắng (chủ đề kinh điển về kìm nén)',
      'Trung cấp',
    ),
    ['seconds'],
  ),
];

/* ------------------------------ groups ------------------------------- */

const P1_HEADINGS = P1_QUESTIONS.filter((_, i) => i >= 3 && i < 8).length; // 5 headings questions
expectCount('IELTS Reading P1 questions', P1_QUESTIONS.length, 13);
expectCount('IELTS Reading P2 questions', P2_QUESTIONS.length, 13);
expectCount('IELTS Reading P3 questions', P3_QUESTIONS.length, 14);
expectCount('IELTS Reading P1 heading questions', P1_HEADINGS, 5);

export const IELTS_READING: SeedGroup[] = [
  {
    title: 'Reading Passage 1 - Urban forests: planting for a cooler city (13 questions)',
    groupType: 'PASSAGE',
    instructions:
      'Câu 1-3: True/False/Not Given. Câu 4-8: chọn tiêu đề đúng cho đoạn văn. Câu 9-13: hoàn thành câu (tối đa 2 từ lấy trong bài).',
    materials: [{ type: 'PASSAGE', title: 'Passage 1 - Urban forests', content: P1_TEXT }],
    questions: P1_QUESTIONS,
  },
  {
    title: 'Reading Passage 2 - Before Columbus: the Norsemen in North America (13 questions)',
    groupType: 'PASSAGE',
    instructions:
      'Câu 1-3: trắc nghiệm hiểu bài. Câu 4-9: tìm đoạn chứa thông tin. Câu 10-13: hoàn thành bản tóm tắt (tối đa 2 từ).',
    materials: [{ type: 'PASSAGE', title: 'Passage 2 - The Norsemen in North America', content: P2_TEXT }],
    questions: P2_QUESTIONS,
  },
  {
    title: 'Reading Passage 3 - Why bad habits are so hard to break (14 questions)',
    groupType: 'PASSAGE',
    instructions:
      'Câu 1-3: Yes/No/Not Given. Câu 4-6: ghi nhãn sơ đồ vòng lặp thói quen. Câu 7-11: nối với người/nghiên cứu. Câu 12-14: trả lời ngắn (tối đa 3 từ).',
    materials: [
      { type: 'PASSAGE', title: 'Passage 3 - Why bad habits are so hard to break', content: P3_TEXT },
      { type: 'IMAGE', title: 'Sơ đồ: vòng lặp thói quen (cue - routine - reward)', fileUrl: '/images/ielts/reading-p3-habit-loop.jpg' },
    ],
    questions: P3_QUESTIONS,
  },
];
