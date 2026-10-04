import { ExamQuestionGroup } from '../../domain/entity/exam-question-group.entity';
import { ExamQuestionGroupOrmEntity } from '../entity/exam-question-group.orm-entity';

export class ExamQuestionGroupMapper {
  static toDomain(entity: ExamQuestionGroupOrmEntity): ExamQuestionGroup {
    return ExamQuestionGroup.restore({
      id: Number(entity.id),
      sectionId: Number(entity.sectionId),
      groupType: entity.groupType,
      title: entity.title,
      instructions: entity.instructions,
      position: entity.position,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
