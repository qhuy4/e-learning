import { ExamQuestion } from '../../domain/entity/exam-question.entity';
import { ExamQuestionOrmEntity } from '../entity/exam-question.orm-entity';

export class ExamQuestionMapper {
  static toDomain(entity: ExamQuestionOrmEntity): ExamQuestion {
    return ExamQuestion.restore({
      id: Number(entity.id),
      sectionId: Number(entity.sectionId),
      groupId: entity.groupId ? Number(entity.groupId) : null,
      type: entity.type,
      question: entity.question,
      explanation: entity.explanation,
      points: Number(entity.points),
      position: entity.position,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
