import { ExamQuestionType } from '../../domain/entity/exam-question-type.entity';
import { ExamQuestionTypeOrmEntity } from '../entity/exam-question-type.orm-entity';

export class ExamQuestionTypeMapper {
  static toDomain(entity: ExamQuestionTypeOrmEntity): ExamQuestionType {
    return ExamQuestionType.restore({
      id: Number(entity.id),
      code: entity.code,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
