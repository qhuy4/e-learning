import { ExamQuestion } from '../../domain/entity/exam-question.entity';
import { ExamQuestionOrmEntity } from '../entity/exam-question.orm-entity';

export class ExamQuestionMapper {
  static toDomain(entity: ExamQuestionOrmEntity): ExamQuestion {
    return ExamQuestion.restore({
      id: Number(entity.id),
      sectionId: Number(entity.sectionId),
      materialId: entity.materialId ? Number(entity.materialId) : null,
      questionTypeId: Number(entity.questionTypeId),
      question: entity.question,
      explanation: entity.explanation,
      points: Number(entity.points),
      position: entity.position,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
