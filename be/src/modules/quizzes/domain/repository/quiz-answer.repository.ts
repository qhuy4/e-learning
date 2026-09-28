import { QuizAnswer } from '../entity/quiz-answer.entity';
export const QUIZ_ANSWER_REPOSITORY = Symbol('QUIZ_ANSWER_REPOSITORY');
export interface IQuizAnswerRepository {
  saveAll(answers: QuizAnswer[]): Promise<void>;
}
