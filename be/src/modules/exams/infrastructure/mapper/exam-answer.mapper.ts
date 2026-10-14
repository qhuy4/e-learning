import { ExamAnswer } from '../../domain/entity/exam-answer.entity';
import { ExamAnswerOrmEntity } from '../entity/exam-answer.orm-entity';

export class ExamAnswerMapper {
  static toDomain(entity: ExamAnswerOrmEntity): ExamAnswer {
    return ExamAnswer.restore({
      id: Number(entity.id),
      attemptId: Number(entity.attemptId),
      questionId: Number(entity.questionId),
      selectedOptionId: entity.selectedOptionId ? Number(entity.selectedOptionId) : null,
      answerText: entity.answerText,
      isCorrect: entity.isCorrect,
      earnedPoints: Number(entity.earnedPoints),
      createdAt: entity.createdAt,
    });
  }
}
