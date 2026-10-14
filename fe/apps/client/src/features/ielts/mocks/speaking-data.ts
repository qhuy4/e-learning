import type { SpeakingPart } from "../types";

/** Speaking practice mock data — Part 1 interview, Part 2 cue card, Part 3 discussion. */
export const IELTS_SPEAKING_PARTS: SpeakingPart[] = [
  {
    part: 1,
    label: "Part 1",
    title: "Introduction & Interview",
    durationMinutes: 5,
    introduction:
      "The examiner asks general questions about familiar topics — home, work, studies and interests. Answer in 2–3 sentences.",
    questions: [
      { id: "p1q1", text: "Do you work, or are you a student?" },
      { id: "p1q2", text: "What do you like most about the place where you live?" },
      { id: "p1q3", text: "How often do you use public transport?" },
      { id: "p1q4", text: "Do you prefer cooking at home or eating out? Why?" },
      { id: "p1q5", text: "What are you hoping to do this weekend?" },
    ],
  },
  {
    part: 2,
    label: "Part 2",
    title: "Long Turn — Cue Card",
    durationMinutes: 4,
    introduction:
      "You have one minute to prepare, then you must speak for one to two minutes. Take notes in the box below.",
    questions: [{ id: "p2q1", text: "Deliver your long turn after the preparation countdown." }],
    cue: {
      topic: "Describe a place you like to visit to relax",
      youShouldSay: [
        "where this place is",
        "how often you go there",
        "what you do there",
        "and explain why you find it relaxing",
      ],
      notePrompt: "You have one minute to make notes. You will then speak for 1–2 minutes.",
      prepSeconds: 60,
      speakSeconds: 120,
    },
  },
  {
    part: 3,
    label: "Part 3",
    title: "Two-way Discussion",
    durationMinutes: 5,
    introduction:
      "The examiner asks more abstract follow-up questions connected to your Part 2 topic. Develop your answers with reasons and examples.",
    questions: [
      { id: "p3q1", text: "Why do people in modern cities need places to relax?" },
      { id: "p3q2", text: "Do you think public parks are still important today?" },
      { id: "p3q3", text: "How has the way people spend their free time changed?" },
      { id: "p3q4", text: "Should employers do more to help staff relax?" },
      { id: "p3q5", text: "Will people need to travel less to feel relaxed in the future?" },
    ],
  },
];

export function getSpeakingParts(): SpeakingPart[] {
  return IELTS_SPEAKING_PARTS;
}

export function speakingQuestionTotal(): number {
  return IELTS_SPEAKING_PARTS.reduce((sum, p) => sum + p.questions.length, 0);
}
