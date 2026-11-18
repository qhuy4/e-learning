import { QuizQuestionType } from '../../domain/enums/quiz-question-type.enum';

/** Option đã rút gọn cho học viên (không kèm isCorrect). */
export interface StudentLessonQuizOption {
  id: number | null;
  content: string;
  position: number;
}

/** Câu hỏi đã rút gọn cho học viên (không kèm isCorrect/explanation). */
export interface StudentLessonQuizQuestion {
  id: number | null;
  question: string;
  type: QuizQuestionType;
  audioUrl: string | null;
  imageUrl: string | null;
  points: number;
  position: number;
  options: StudentLessonQuizOption[];
}

/** Quiz đã rút gọn cho học viên — kết quả GetStudentLessonQuizzesQuery. */
export interface StudentLessonQuizItem {
  id: number | null;
  title: string;
  description: string | null;
  timeLimit: number | null;
  passingScore: number;
  maxAttempts: number;
  showAnswerAfterSubmit: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  attemptsUsed: number;
  latestAttempt: {
    score: number;
    correctCount: number;
    totalQuestions: number;
    passed: boolean;
  } | null;
  questions: StudentLessonQuizQuestion[];
}

export class GetStudentLessonQuizzesQuery {
  constructor(
    public readonly lessonId: string,
    public readonly userId: number,
  ) {}
}
