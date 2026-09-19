import { ExamMaterial } from '../../domain/entity/exam-material.entity';
import { ExamMaterialOrmEntity } from '../entity/exam-material.orm-entity';

export class ExamMaterialMapper {
  static toDomain(entity: ExamMaterialOrmEntity): ExamMaterial {
    return ExamMaterial.restore({
      id: Number(entity.id),
      sectionId: Number(entity.sectionId),
      type: entity.type,
      title: entity.title,
      content: entity.content,
      fileUrl: entity.fileUrl,
      transcript: entity.transcript,
      position: entity.position,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
