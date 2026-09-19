import { LessonQuiz } from '../entity/lesson-quiz.entity';
export const LESSON_QUIZ_REPOSITORY = Symbol('LESSON_QUIZ_REPOSITORY');
export interface ILessonQuizRepository {
  findByLessonId(lessonId: number): Promise<LessonQuiz[]>;
  create(lessonQuiz: LessonQuiz): Promise<LessonQuiz>;
  delete(lessonId: number, quizId: number): Promise<void>;
}
