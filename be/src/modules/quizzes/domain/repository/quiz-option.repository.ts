import { QuizOption } from '../entity/quiz-option.entity';
export const QUIZ_OPTION_REPOSITORY = Symbol('QUIZ_OPTION_REPOSITORY');
export interface IQuizOptionRepository {
  findByQuestionIds(questionIds: number[]): Promise<QuizOption[]>;
}
