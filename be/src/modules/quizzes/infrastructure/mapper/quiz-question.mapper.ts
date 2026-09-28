import { QuizQuestion } from '../../domain/entity/quiz-question.entity';
import { QuizQuestionOrmEntity } from '../entity/quiz-question.orm-entity';
export class QuizQuestionMapper {
  static toDomain(entity: QuizQuestionOrmEntity): QuizQuestion {
    return QuizQuestion.restore({
      id: Number(entity.id),
      quizId: Number(entity.quizId),
      question: entity.question,
      type: entity.type,
      audioUrl: entity.audioUrl,
      imageUrl: entity.imageUrl,
      explanation: entity.explanation,
      points: entity.points,
      position: entity.position,
      createdAt: entity.createdAt,
    });
  }
}
