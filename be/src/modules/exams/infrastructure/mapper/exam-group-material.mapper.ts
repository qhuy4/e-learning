import { ExamGroupMaterial } from '../../domain/entity/exam-group-material.entity';
import { ExamGroupMaterialOrmEntity } from '../entity/exam-group-material.orm-entity';

export class ExamGroupMaterialMapper {
  static toDomain(entity: ExamGroupMaterialOrmEntity): ExamGroupMaterial {
    return ExamGroupMaterial.restore({
      id: Number(entity.id),
      groupId: Number(entity.groupId),
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
