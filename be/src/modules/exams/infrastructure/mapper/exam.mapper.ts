import { Exam } from '../../domain/entity/exam.entity';
import { ExamOrmEntity } from '../entity/exam.orm-entity';

export class ExamMapper {
  static toDomain(entity: ExamOrmEntity): Exam {
    return Exam.restore({
      id: Number(entity.id),
      examFormatId: Number(entity.examFormatId),
      title: entity.title,
      description: entity.description,
      isPremium: entity.isPremium,
      durationSeconds: entity.durationSeconds,
      status: entity.status,
      createdBy: entity.createdBy ? Number(entity.createdBy) : null,
      publishedAt: entity.publishedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
