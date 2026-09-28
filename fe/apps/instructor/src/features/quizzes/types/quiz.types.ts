export enum QuizQuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
}

export interface QuizOption {
  id?: number;
  content: string;
  isCorrect: boolean;
  position: number;
}

export interface QuizQuestion {
  id?: number;
  question: string;
  type: QuizQuestionType;
  audioUrl?: string;
  imageUrl?: string;
  explanation?: string;
  points: number;
  position: number;
  options: QuizOption[];
}

export interface Quiz {
  id?: number;
  title: string;
  description?: string;
  isPremium?: boolean;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showAnswerAfterSubmit?: boolean;
  questions?: QuizQuestion[];
}
