import { Quiz } from '../../domain/entity/quiz.entity';
import { QuizQuestion } from '../../domain/entity/quiz-question.entity';
import { QuizOption } from '../../domain/entity/quiz-option.entity';

/** Quiz kèm danh sách câu hỏi và options của từng câu — kết quả GetQuizByIdQuery. */
export type QuizWithQuestions = Omit<Quiz, 'update'> & {
  questions: Array<QuizQuestion & { options: QuizOption[] }>;
};

export class GetQuizByIdQuery { constructor(public readonly id: string) {} }
