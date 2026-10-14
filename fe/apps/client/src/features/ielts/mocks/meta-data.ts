import { QUESTION_TYPE_META } from "../constants";
import { getAllQuestions } from "../data/source";
import type { IeltsCandidate, IeltsQuestion, IeltsStats, IeltsTestCard } from "../types";

/** Mock candidate shown on the instructions page. */
export const MOCK_CANDIDATE: IeltsCandidate = {
  name: "Nguyễn Minh Anh",
  candidateNumber: "VI-8842190",
  module: "Academic",
  testDate: "26/09/2026",
  examCode: "IELTS-AC-2609-A",
  centre: "Ha Noi Exam Centre — Room 3A",
};

/** Landing page statistics (demo data). */
export const MOCK_STATS: IeltsStats = {
  lastBand: 7,
  bestBand: 7.5,
  attempts: 4,
  completion: 68,
};

/** Available tests shown as cards on the landing page. */
export const MOCK_TESTS: IeltsTestCard[] = [
  {
    id: "cambridge-18",
    title: "Cambridge IELTS Test 18",
    subtitle: "Full academic set from Cambridge — 4 skills, official timing.",
    duration: "2h 45m",
    skills: ["Listening", "Reading", "Writing"],
    level: "Academic",
    premium: false,
  },
  {
    id: "academic-mock",
    title: "IELTS Academic Mock Test",
    subtitle: "Mock exam with instant band report and detailed review mode.",
    duration: "2h 45m",
    skills: ["Listening", "Reading", "Writing", "Speaking"],
    level: "Academic",
    premium: true,
  },
  {
    id: "general-practice",
    title: "IELTS General Practice",
    subtitle: "General Training reading & writing — everyday contexts.",
    duration: "2h 30m",
    skills: ["Listening", "Reading", "Writing"],
    level: "General Training",
    premium: false,
  },
  {
    id: "full-practice",
    title: "Full Practice Test",
    subtitle: "Complete CBT run-through with review before submission.",
    duration: "2h 45m",
    skills: ["Listening", "Reading", "Writing", "Speaking"],
    level: "Academic",
    premium: true,
  },
];

/** Short Vietnamese descriptions used in the header / navigator. */
export const MODULE_DESCRIPTIONS: Record<string, string> = {
  listening: "Nghe 4 section — audio phát 1 lần, làm bài trong lúc nghe",
  reading: "3 passage — 60 phút, không có thời gian chuyển đáp án riêng",
  writing: "Task 1 (150 từ, 20 phút) + Task 2 (250 từ, 40 phút)",
  speaking: "Thực hành 3 part với mic trình duyệt — ghi âm và nghe lại được trong phiên",
  review: "Kiểm tra lại toàn bộ bài làm trước khi nộp",
};

/** Exam information block on the landing page. */
export const LANDING_INFO_ROWS = [
  { label: "Total duration", value: "2h 45m" },
  { label: "Listening", value: "30 minutes" },
  { label: "Reading", value: "60 minutes" },
  { label: "Writing", value: "60 minutes" },
  { label: "Speaking Practice", value: "10–15 minutes" },
];

/* ------------------------------------------------------------------ *
 * Demo answer presets (result page fallback when nothing was submitted)
 * ------------------------------------------------------------------ */

function wrongAnswerFor(q: IeltsQuestion): string {
  const control = QUESTION_TYPE_META[q.type].control;
  if (control === "multi") return "A";
  if (control === "choice") {
    const letters = q.options?.length ?? 4;
    const correctIndex = (q.letters ?? ["A", "B", "C", "D", "E", "F", "G", "H"]).indexOf(q.correct);
    const next = (correctIndex + 1 + letters) % letters;
    return (q.letters ?? ["A", "B", "C", "D", "E", "F", "G", "H"])[next] ?? "A";
  }
  if (control === "select" && q.options) {
    const wrong = q.options.find((opt) => opt !== q.correct);
    return wrong ?? q.options[0] ?? "";
  }
  return "not given";
}

/** Builds a plausible half-finished submission used for the demo report. */
export function buildPresetAnswers(): Record<number, string> {
  const answers: Record<number, string> = {};
  getAllQuestions().forEach((q, index) => {
    if (index % 9 === 4) return; // skipped
    answers[q.id] = index % 7 === 3 ? wrongAnswerFor(q) : q.correct;
  });
  return answers;
}

export const PRESET_DRAFTS: Record<number, string> = {
  1: `The bar chart compares the proportion of households with internet access in Vietnam, Brazil and Canada between the year 2000 and 2020.

Overall, the figure rose sharply in all three countries over the period, and Canada consistently remained the highest, whereas Vietnam started from the lowest point but recorded the most dramatic growth.

In 2000, roughly sixty per cent of Canadian households were connected, compared with about thirty per cent in Brazil and fewer than five per cent in Vietnam. Twenty years later, Canada had climbed to over ninety-five per cent, Brazil had reached around eighty per cent, and Vietnam had risen to approximately seventy per cent, which represents the fastest increase of the three nations.`,
  2: `There is an ongoing debate about whether universities should admit only the strongest students academically, or consider a broader range of talents. In my view, while high grades matter, a balanced admission process produces better outcomes for society.

On the one hand, restricting places to top scorers seems fair and efficient. Academic results are objective, they predict how well students cope with demanding coursework, and departments such as medicine clearly require a high level of prior knowledge. If a course is highly selective, standards can be maintained and employers continue to trust the degree.

On the other hand, universities are not only training grounds for examinations. Successful graduates also need leadership, creativity, communication and practical experience, none of which appear on a transcript. A candidate who has run a small business, organised a volunteer team or excelled in sport may contribute more to group projects and later to the economy than someone with perfect examination scores.

For this reason, I believe admissions tutors should combine academic evidence with interviews, personal statements and demonstrated skills. This approach keeps standards high while recognising the wider abilities that modern workplaces demand.`,
};

export const PRESET_SPEAKING_RECORDED: Record<number, boolean> = { 1: true, 2: true, 3: false };

export const PRESET_SPEAKING_ANSWERED: Record<string, boolean> = {
  p1q1: true,
  p1q2: true,
  p1q3: true,
  p1q4: true,
  p2q1: true,
  p3q1: true,
  p3q2: true,
};
