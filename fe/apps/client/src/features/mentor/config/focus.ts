export interface FocusOption {
  id: string;
  title: string;
  description: string;
}

export const FOCUS_OPTIONS: FocusOption[] = [
  {
    id: "hesitation",
    title: "Overcome Speaking Hesitation & Filler Pauses",
    description:
      'Techniques to reduce "um", silence gaps, and formulate thoughts fluently',
  },
  {
    id: "idioms",
    title: "Idiomatic Phrasing & Natural B2 Transitions",
    description:
      "Sounding authentic instead of textbook-formal in everyday dialogue",
  },
  {
    id: "pronunciation",
    title: "Pronunciation & Intonation Fine-Tuning",
    description:
      "Word linking, sentence stress rhythms, and soft vowel clarity",
  },
  {
    id: "ielts",
    title: "IELTS / Cambridge Speaking Test Strategy",
    description:
      "Rubric expectations, Part 2 & 3 pacing, and vocabulary elevation",
  },
  {
    id: "general",
    title: "Other / General Diagnostic Assessment",
    description:
      "Open conversation to benchmark live conversational ease against PiEMind metrics",
  },
];
