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

export interface Exam {
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
