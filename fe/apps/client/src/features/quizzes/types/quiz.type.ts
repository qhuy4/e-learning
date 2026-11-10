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
  showAnswerAfterSubmit: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  /** Số lần học viên đã NỘP bài */
  attemptsUsed: number;
  /** Kết quả lần nộp gần nhất, chỉ trả cho học viên đã ghi danh. */
  latestAttempt?: {
    score: number;
    correctCount: number;
    totalQuestions: number;
    passed: boolean;
  } | null;
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

export interface QuizAttemptHistoryItem {
  id: string | number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string | null;
  passed: boolean;
}

export interface QuizAttemptReview {
  attemptId: string | number;
  questions: Array<{
    id: number;
    question: string;
    isCorrect: boolean;
    earnedPoints: number;
    selectedAnswer: string | null;
    correctAnswer: string | null;
  }>;
}

export interface SubmitQuizAnswer {
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
}
