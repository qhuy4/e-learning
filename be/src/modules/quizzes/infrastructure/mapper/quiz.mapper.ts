import { Quiz } from '../../domain/entity/quiz.entity';
import { QuizOrmEntity } from '../entity/quiz.orm-entity';
export class QuizMapper {
  static toDomain(entity: QuizOrmEntity): Quiz {
    return Quiz.restore({
      id: Number(entity.id),
      title: entity.title,
      description: entity.description,
      isPremium: entity.isPremium,
      timeLimit: entity.timeLimit,
      passingScore: entity.passingScore,
      maxAttempts: entity.maxAttempts,
      shuffleQuestions: entity.shuffleQuestions,
      shuffleOptions: entity.shuffleOptions,
      showAnswerAfterSubmit: entity.showAnswerAfterSubmit,
      createdBy: entity.createdBy ? Number(entity.createdBy) : null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
