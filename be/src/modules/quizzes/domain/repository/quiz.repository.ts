import { Quiz } from '../entity/quiz.entity';
export const QUIZ_REPOSITORY = Symbol('QUIZ_REPOSITORY');
export interface IQuizRepository {
  findById(id: number): Promise<Quiz | null>;
  findAll(): Promise<Quiz[]>;
  findByCreator(userId: number): Promise<Quiz[]>;
  create(quiz: Quiz): Promise<Quiz>;
  update(quiz: Quiz): Promise<Quiz>;
  delete(id: number): Promise<void>;
}
