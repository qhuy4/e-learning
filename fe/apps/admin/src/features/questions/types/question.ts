export interface CourseQuestion {
  id: string;
  content: string;
  status: QuestionStatus;
  lastActivityAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  course?: { id: string; title: string };
  user?: { id: string; name: string };
  answerCount?: number;
  answers?: CourseQuestionAnswer[];
}

export interface CourseQuestionAnswer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  status: QuestionStatus;
  createdAt: Date | null;
  user?: { id: string; name: string };
}

export const QuestionStatus = {
  HIDDEN: 0,
  VISIBLE: 1,
} as const;

export type QuestionStatus = (typeof QuestionStatus)[keyof typeof QuestionStatus];

export const questionStatusLabel: Record<QuestionStatus, string> = {
  [QuestionStatus.HIDDEN]: "Ẩn",
  [QuestionStatus.VISIBLE]: "Hiển thị",
};

export const questionStatusClassName: Record<QuestionStatus, string> = {
  [QuestionStatus.HIDDEN]:
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  [QuestionStatus.VISIBLE]:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};
