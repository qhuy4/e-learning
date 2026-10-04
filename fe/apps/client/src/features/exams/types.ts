export const ExamStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type ExamStatus = (typeof ExamStatus)[keyof typeof ExamStatus];

export const ExamAttemptStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  EXPIRED: 'EXPIRED',
} as const;
export type ExamAttemptStatus = (typeof ExamAttemptStatus)[keyof typeof ExamAttemptStatus];

export const ExamMaterialType = {
  AUDIO: 'AUDIO',
  PASSAGE: 'PASSAGE',
  IMAGE: 'IMAGE',
  TEXT: 'TEXT',
} as const;
export type ExamMaterialType = (typeof ExamMaterialType)[keyof typeof ExamMaterialType];

export const ExamGroupType = {
  AUDIO: 'AUDIO',
  PASSAGE: 'PASSAGE',
  IMAGE: 'IMAGE',
  CUSTOM: 'CUSTOM',
} as const;
export type ExamGroupType = (typeof ExamGroupType)[keyof typeof ExamGroupType];

/**
 * Kiểu câu hỏi của đề thi — các dạng TEXT (FILL_BLANK / SHORT_ANSWER /
 * ESSAY / AUDIO_RECORD) không có `options` và được lưu qua `answerText`
 * (không chấm điểm tự động).
 */
export const QuestionType = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  MULTI_SELECT: 'MULTI_SELECT',
  TRUE_FALSE: 'TRUE_FALSE',
  FILL_BLANK: 'FILL_BLANK',
  MATCHING: 'MATCHING',
  SHORT_ANSWER: 'SHORT_ANSWER',
  ESSAY: 'ESSAY',
  AUDIO_RECORD: 'AUDIO_RECORD',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export interface Exam {
  id: number;
  examFormatId: number;
  /**
   * Tên loại đề từ backend ("TOEIC" | "IELTS" | "GENERAL") — API list/detail.
   * Client-side demo entries (mocks) carry `null`.
   */
  examTypeName: string | null;
  /**
   * Tên định dạng đề từ backend (VD "TOEIC Format 2026") — API list/detail.
   * Mocks carry `null`.
   */
  examFormatName: string | null;
  title: string;
  description: string | null;
  isPremium: boolean;
  durationSeconds: number | null;
  status: ExamStatus;
  createdBy: number | null;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sections?: ExamSection[];
}

export interface ExamGroupMaterial {
  id: number;
  groupId: number;
  type: ExamMaterialType;
  title: string | null;
  content: string | null;
  fileUrl: string | null;
  transcript: string | null;
  position: number;
}

export interface ExamQuestionGroup {
  id: number;
  sectionId: number;
  groupType: ExamGroupType | null;
  title: string | null;
  instructions: string | null;
  position: number;
  materials?: ExamGroupMaterial[];
  questions?: ExamQuestion[];
}

export interface ExamSection {
  id: number;
  examId: number;
  formatSectionId: number | null;
  name: string;
  description: string | null;
  instructions: string | null;
  position: number;
  durationSeconds: number | null;
  questionCount: number;
  /** Kỹ năng có cấu trúc: LISTENING / READING / WRITING / SPEAKING (null = dữ liệu cũ). */
  sectionType?: string | null;
  questions?: ExamQuestion[];
  groups?: ExamQuestionGroup[];
}

export interface ExamQuestion {
  id: number;
  sectionId: number;
  groupId: number | null;
  type: string;
  question: string;
  explanation: string | null;
  points: number;
  position: number;
  options?: ExamOption[];
}

export interface ExamOption {
  id: number;
  questionId: number;
  content: string;
  isCorrect: boolean;
  position: number;
}

export interface ExamAttempt {
  id: number;
  examId: number;
  userId: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  status: ExamAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  createdAt: string;
}

/** Attempt enriched with the exam title (history lists). */
export interface ExamAttemptWithExam extends ExamAttempt {
  examTitle: string;
  /** LOẠI đề (TOEIC / IELTS / GENERAL) — client chọn giao diện + route đúng. */
  examTypeName?: string | null;
}

/** Exam-type tabs on the listing page ("Đề thi" → choose a type). */
export type ExamCategory = "GENERAL" | "TOEIC" | "IELTS";

/**
 * Skill tags a module exam covers (separate from the API's structural
 * `Exam.sections`): TOEIC → "LR" (Nghe & Đọc) / "WRITING" / "SPEAKING",
 * IELTS → 4 kỹ năng LISTENING / READING / WRITING / SPEAKING.
 * A full mock lists every skill it contains.
 */
export type ExamSectionTag =
  | "LR"
  | "LISTENING"
  | "READING"
  | "WRITING"
  | "SPEAKING";

/** Listing row: an API exam or a client-side module exam (TOEIC / IELTS demo). */
export interface ExamListItem extends Exam {
  category: ExamCategory;
  /** Skills this exam belongs to — powers the "Kỹ năng" sub-tabs. */
  skills: ExamSectionTag[];
  /** Internal route of the UI module — clicking "Làm bài" opens it. */
  href?: string;
}

export interface ExamAnswer {
  id: number;
  attemptId: number;
  questionId: number;
  selectedOptionId: number | null;
  answerText: string | null;
  isCorrect: boolean;
  earnedPoints: number;
  createdAt: string;
}

export interface SubmitExamAnswerDto {
  questionId: number;
  selectedOptionId?: number;
  answerText?: string;
}

export interface SubmitExamAttemptDto {
  answers: SubmitExamAnswerDto[];
}
