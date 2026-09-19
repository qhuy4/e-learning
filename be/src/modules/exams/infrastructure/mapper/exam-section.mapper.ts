import { ExamSection } from '../../domain/entity/exam-section.entity';
import { ExamSectionOrmEntity } from '../entity/exam-section.orm-entity';

export class ExamSectionMapper {
  static toDomain(entity: ExamSectionOrmEntity): ExamSection {
    return ExamSection.restore({
      id: Number(entity.id),
      examId: Number(entity.examId),
      formatSectionId: Number(entity.formatSectionId),
      code: entity.code,
      name: entity.name,
      instructions: entity.instructions,
      position: entity.position,
      durationSeconds: entity.durationSeconds,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
