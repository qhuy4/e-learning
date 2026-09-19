export interface Question {
  id: number;
  courseId: number;
  userId: number;
  content: string;
  status: number;
  lastActivityAt: string | null;
  createdAt: string | null;
  course?: { id: number; title: string };
  user?: { id: number; name: string };
  answerCount: number;
  answers?: QuestionAnswer[];
}

export interface QuestionAnswer {
  id: number;
  questionId: number;
  userId: number;
  content: string;
  status: number;
  createdAt: string | null;
  user?: { id: number; name: string };
}

export const QUESTION_STATUS_LABELS: Record<number, string> = {
  1: "Mở",
  2: "Đã khóa",
  3: "Đã ẩn",
};

export const QUESTION_STATUS_CLASSES: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  3: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export const ANSWER_STATUS_LABELS: Record<number, string> = {
  1: "Hiện",
  2: "Đã ẩn",
};

export const ANSWER_STATUS_CLASSES: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  2: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};
