import { QuizQuestion } from '../entity/quiz-question.entity';
export const QUIZ_QUESTION_REPOSITORY = Symbol('QUIZ_QUESTION_REPOSITORY');
export interface IQuizQuestionRepository {
  findByQuizId(quizId: number): Promise<QuizQuestion[]>;
}
