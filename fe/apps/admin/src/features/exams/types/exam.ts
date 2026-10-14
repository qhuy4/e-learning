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

export const QUESTION_GROUP_TYPE_LABELS: Record<ExamGroupType, string> = {
  AUDIO: 'Hội thoại / Nghe',
  PASSAGE: 'Đoạn văn',
  IMAGE: 'Hình ảnh',
  CUSTOM: 'Tuỳ chỉnh',
};

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

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm — một đáp án',
  MULTI_SELECT: 'Trắc nghiệm — nhiều đáp án',
  TRUE_FALSE: 'Đúng / Sai',
  FILL_BLANK: 'Điền vào chỗ trống',
  MATCHING: 'Nối đáp án',
  SHORT_ANSWER: 'Trả lời ngắn',
  ESSAY: 'Tự luận',
  AUDIO_RECORD: 'Thu âm câu trả lời',
};

export const MATERIAL_TYPE_LABELS: Record<ExamMaterialType, string> = {
  AUDIO: 'Âm thanh (hội thoại)',
  PASSAGE: 'Đoạn văn',
  IMAGE: 'Hình ảnh',
  TEXT: 'Văn bản',
};

export interface AdminExamType {
  id: number;
  name: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  /** Soft delete — null = còn hiệu lực; có giá trị = đang ở mục "Đã xóa". */
  deletedAt?: string | null;
}

export interface AdminExamFormat {
  id: number;
  examTypeId: number;
  name: string;
  version: string | null;
  description: string | null;
  durationSeconds: number | null;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  /** Soft delete — null = còn hiệu lực; có giá trị = đang ở mục "Đã xóa". */
  deletedAt?: string | null;
}

export interface AdminExamFormatSection {
  id: number;
  examFormatId: number;
  name: string;
  description: string | null;
  instructions: string | null;
  position: number;
  durationSeconds: number | null;
  questionCount: number | null;
  /** Kỹ năng có cấu trúc: LISTENING / READING / WRITING / SPEAKING. */
  sectionType?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminExam {
  id: number;
  examFormatId: number;
  title: string;
  description: string | null;
  isPremium: boolean;
  durationSeconds: number | null;
  status: ExamStatus;
  createdBy: number | null;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  /** Soft delete — null = còn hiệu lực; có giá trị = đang ở mục "Đã xóa". */
  deletedAt?: string | null;
  sections?: AdminExamSection[];
}

export interface AdminExamGroupMaterial {
  id: number;
  groupId: number;
  type: ExamMaterialType;
  title: string | null;
  content: string | null;
  fileUrl: string | null;
  transcript: string | null;
  position: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminExamQuestionGroup {
  id: number;
  sectionId: number;
  groupType: ExamGroupType | null;
  title: string | null;
  instructions: string | null;
  position: number;
  materials?: AdminExamGroupMaterial[];
  questions?: AdminExamQuestion[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminExamSection {
  id: number;
  examId: number;
  formatSectionId: number | null;
  name: string;
  description: string | null;
  instructions: string | null;
  position: number;
  durationSeconds: number | null;
  questionCount: number;
  /** Kỹ năng kế thừa từ format: LISTENING / READING / WRITING / SPEAKING. */
  sectionType?: string | null;
  questions?: AdminExamQuestion[];
  groups?: AdminExamQuestionGroup[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminExamQuestion {
  id: number;
  sectionId: number;
  groupId: number | null;
  type: QuestionType;
  question: string;
  explanation: string | null;
  points: number;
  position: number;
  createdAt: string | null;
  updatedAt: string | null;
  options?: AdminExamOption[];
}

export interface AdminExamOption {
  id: number;
  questionId: number;
  content: string;
  isCorrect: boolean;
  position: number;
  createdAt: string | null;
}

export interface CreateExamTypeDto {
  name: string;
  description?: string;
}

export interface UpdateExamTypeDto {
  name?: string;
  description?: string;
}

export interface CreateExamFormatSectionDto {
  name: string;
  description?: string;
  instructions?: string;
  position: number;
  durationSeconds?: number;
  questionCount?: number;
  /** LISTENING / READING / WRITING / SPEAKING — null = chưa gán. */
  sectionType?: string | null;
}

/** Giá trị sentinel của Select (Radix Select không nhận value=""). */
export const SECTION_TYPE_NONE = "__none__";

/** Giá trị section_type hợp lệ (exam_format_sections.section_type). */
export const SECTION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "LISTENING", label: "Listening (Nghe)" },
  { value: "READING", label: "Reading (Đọc)" },
  { value: "WRITING", label: "Writing (Viết)" },
  { value: "SPEAKING", label: "Speaking (Nói)" },
];

export interface CreateExamFormatDto {
  examTypeId: number;
  name: string;
  version?: string;
  description?: string;
  durationSeconds?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  sections?: CreateExamFormatSectionDto[];
}

export interface UpdateExamFormatDto {
  name?: string;
  version?: string;
  description?: string;
  durationSeconds?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface CreateExamDto {
  examFormatId: number;
  title: string;
  description?: string;
  isPremium?: boolean;
  durationSeconds?: number;
}

export interface UpdateExamDto {
  title?: string;
  description?: string;
  isPremium?: boolean;
  durationSeconds?: number;
}

export interface CreateExamGroupMaterialDto {
  type: ExamMaterialType;
  title?: string;
  content?: string;
  fileUrl?: string;
  transcript?: string;
  position?: number;
}

export interface UpdateExamGroupMaterialDto {
  type?: ExamMaterialType;
  title?: string;
  content?: string;
  fileUrl?: string;
  transcript?: string;
  position?: number;
}

export interface CreateExamOptionDto {
  content: string;
  isCorrect: boolean;
  position: number;
}

export interface CreateExamQuestionDto {
  type: QuestionType;
  question: string;
  explanation?: string;
  points?: number;
  position: number;
  options?: CreateExamOptionDto[];
}

export interface UpdateExamQuestionDto {
  sectionId?: number;
  groupId?: number | null;
  type?: QuestionType;
  question?: string;
  explanation?: string;
  points?: number;
  position?: number;
  options?: CreateExamOptionDto[];
}

export interface AdminExamAttempt {
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

export interface AdminExamAnswer {
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
