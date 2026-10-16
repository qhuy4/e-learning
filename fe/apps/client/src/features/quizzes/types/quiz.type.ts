// ─── Quiz cho học viên (GET /student/quizzes/lesson/:lessonId) ─────────────
// BE không trả về isCorrect / explanation để tránh lộ đáp án.

export interface QuizOption {
  id: number;
  content: string;
  position: number;
}

export type QuizQuestionType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | string;

export interface QuizQuestion {
  id: number;
  question: string;
  type: QuizQuestionType;
  audioUrl: string | null;
  imageUrl: string | null;
  points: number;
  position: number;
  options: QuizOption[];
}

export interface LessonQuiz {
  id: number;
  title: string;
  description: string | null;
  /** Thời gian làm bài (phút), null = không giới hạn */
  timeLimit: number | null;
  /** Điểm đạt (điểm thô), 0 = không yêu cầu */
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  /** Số lần học viên đã NỘP bài */
  attemptsUsed: number;
  questions: QuizQuestion[];
}

/** Kết quả attempt sau khi nộp (POST .../start hoặc .../submit) */
export interface QuizAttemptResult {
  id: string | number;
  quizId: string | number;
  /** Điểm thô đã tích lũy (tổng points của câu đúng) */
  score: number;
  correctCount: number;
  totalQuestions: number;
  status: string;
  startedAt?: string | null;
  submittedAt?: string | null;
}

export interface SubmitQuizAnswer {
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
}
