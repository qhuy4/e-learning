import { LessonQuiz } from '../../domain/entity/lesson-quiz.entity';
import { LessonQuizOrmEntity } from '../entity/lesson-quiz.orm-entity';
export class LessonQuizMapper {
  static toDomain(entity: LessonQuizOrmEntity): LessonQuiz {
    return LessonQuiz.restore({
      lessonId: Number(entity.lessonId),
      quizId: Number(entity.quizId),
    });
  }
}
