import { QuizAttempt } from '../entity/quiz-attempt.entity';
export const QUIZ_ATTEMPT_REPOSITORY = Symbol('QUIZ_ATTEMPT_REPOSITORY');
export interface IQuizAttemptRepository {
  findById(id: number): Promise<QuizAttempt | null>;
  create(attempt: QuizAttempt): Promise<QuizAttempt>;
  update(attempt: QuizAttempt): Promise<QuizAttempt>;
}
