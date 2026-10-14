import type { WritingTask } from "../types";

/** Writing mock data — Academic Task 1 (150 words / 20 min) + Task 2 (250 words / 40 min). */
export const IELTS_WRITING_TASKS: WritingTask[] = [
  {
    id: 1,
    label: "Task 1",
    title: "Writing Task 1 — Report on a chart",
    prompt:
      "The chart below shows the percentage of households with internet access in three countries between 2000 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words. You should spend about 20 minutes on this task.",
    minWords: 150,
    recommendedMinutes: 20,
    figure: {
      kind: "bar",
      caption: "Percentage of households with internet access, 2000–2020 (demo chart placeholder)",
    },
    keywords: ["Overview", "Comparisons", "Trends over time", "Data vocabulary"],
  },
  {
    id: 2,
    label: "Task 2",
    title: "Writing Task 2 — Essay",
    prompt:
      "Some people believe that universities should only offer places to students with the highest academic results, while others think that a wider range of abilities should be considered.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words. You should spend about 40 minutes on this task.",
    minWords: 250,
    recommendedMinutes: 40,
    keywords: ["Position", "Two body paragraphs", "Concession", "Examples"],
  },
];

/** Recommended time split shown on the writing page. */
export const WRITING_TIME_SPLIT: Record<number, number> = { 1: 20, 2: 40 };
