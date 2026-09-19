import { QuizOption } from '../../domain/entity/quiz-option.entity';
import { QuizOptionOrmEntity } from '../entity/quiz-option.orm-entity';
export class QuizOptionMapper {
  static toDomain(entity: QuizOptionOrmEntity): QuizOption {
    return QuizOption.restore({
      id: Number(entity.id),
      questionId: Number(entity.questionId),
      content: entity.content,
      isCorrect: entity.isCorrect,
      position: entity.position,
    });
  }
}
