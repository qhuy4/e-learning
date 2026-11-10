import { QuizAttempt } from '../entity/quiz-attempt.entity';
export const QUIZ_ATTEMPT_REPOSITORY = Symbol('QUIZ_ATTEMPT_REPOSITORY');
export interface IQuizAttemptRepository {
  findById(id: number): Promise<QuizAttempt | null>;
  create(attempt: QuizAttempt): Promise<QuizAttempt>;
  update(attempt: QuizAttempt): Promise<QuizAttempt>;
  /** Số lần học viên đã NỘP bài cho quiz này. */
  countByQuizAndUser(quizId: number, userId: number): Promise<number>;
  /** Lần nộp gần nhất để hiển thị điểm và trạng thái trong lộ trình học. */
  findLatestSubmittedByQuizAndUser(quizId: number, userId: number): Promise<QuizAttempt | null>;
  findSubmittedByQuizAndUser(quizId: number, userId: number): Promise<QuizAttempt[]>;
}
