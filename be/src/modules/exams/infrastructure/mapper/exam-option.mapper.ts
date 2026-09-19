import { ExamOption } from '../../domain/entity/exam-option.entity';
import { ExamOptionOrmEntity } from '../entity/exam-option.orm-entity';

export class ExamOptionMapper {
  static toDomain(entity: ExamOptionOrmEntity): ExamOption {
    return ExamOption.restore({
      id: Number(entity.id),
      questionId: Number(entity.questionId),
      content: entity.content,
      isCorrect: entity.isCorrect,
      position: entity.position,
      createdAt: entity.createdAt,
    });
  }
}
