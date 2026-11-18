import { Quiz } from '../../domain/entity/quiz.entity';
import { QuizQuestion } from '../../domain/entity/quiz-question.entity';

/** Quiz kèm câu hỏi (chưa có options) — kết quả GetLessonQuizzesQuery. */
export type LessonQuizzesResult = Array<
  Omit<Quiz, 'update'> & { questions: QuizQuestion[] }
>;

export class GetLessonQuizzesQuery { constructor(public readonly lessonId: string) {} }
