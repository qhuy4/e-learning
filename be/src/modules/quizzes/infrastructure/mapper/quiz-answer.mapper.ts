import { QuizAnswer } from '../../domain/entity/quiz-answer.entity';
import { QuizAnswerOrmEntity } from '../entity/quiz-answer.orm-entity';
export class QuizAnswerMapper {
  static toDomain(entity: QuizAnswerOrmEntity): QuizAnswer {
    return QuizAnswer.restore({
      id: Number(entity.id),
      attemptId: Number(entity.attemptId),
      questionId: Number(entity.questionId),
      selectedOptionId: entity.selectedOptionId ? Number(entity.selectedOptionId) : null,
      answerText: entity.answerText,
      isCorrect: entity.isCorrect,
      earnedPoints: entity.earnedPoints,
      createdAt: entity.createdAt,
    });
  }
}
