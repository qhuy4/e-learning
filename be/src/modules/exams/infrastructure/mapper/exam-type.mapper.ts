import { ExamType } from '../../domain/entity/exam-type.entity';
import { ExamTypeOrmEntity } from '../entity/exam-type.orm-entity';

export class ExamTypeMapper {
  static toDomain(entity: ExamTypeOrmEntity): ExamType {
    return ExamType.restore({
      id: Number(entity.id),
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
