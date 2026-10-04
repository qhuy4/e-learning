import { ExamFormatSection } from '../../domain/entity/exam-format-section.entity';
import { ExamFormatSectionOrmEntity } from '../entity/exam-format-section.orm-entity';

export class ExamFormatSectionMapper {
  static toDomain(entity: ExamFormatSectionOrmEntity): ExamFormatSection {
    return ExamFormatSection.restore({
      id: Number(entity.id),
      examFormatId: Number(entity.examFormatId),
      name: entity.name,
      description: entity.description,
      instructions: entity.instructions,
      position: entity.position,
      durationSeconds: entity.durationSeconds,
      questionCount: entity.questionCount,
      sectionType: entity.sectionType ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
