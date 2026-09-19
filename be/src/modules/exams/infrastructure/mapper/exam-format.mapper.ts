import { ExamFormat } from '../../domain/entity/exam-format.entity';
import { ExamFormatOrmEntity } from '../entity/exam-format.orm-entity';

export class ExamFormatMapper {
  static toDomain(entity: ExamFormatOrmEntity): ExamFormat {
    return ExamFormat.restore({
      id: Number(entity.id),
      examTypeId: Number(entity.examTypeId),
      code: entity.code,
      name: entity.name,
      version: Number(entity.version),
      description: entity.description,
      durationSeconds: entity.durationSeconds,
      isActive: entity.isActive,
      effectiveFrom: entity.effectiveFrom,
      effectiveTo: entity.effectiveTo,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
