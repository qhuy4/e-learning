import { Lesson } from '../../domain/entity/lesson.entity';
import { LessonOrmEntity } from '../entity/lesson.orm-entity';

export class LessonMapper {
  static toDomain(entity: LessonOrmEntity): Lesson {
    return Lesson.restore({
      id: Number(entity.id),
      sectionId: Number(entity.sectionId),
      title: entity.title,
      slug: entity.slug,
      type: entity.type,
      videoProvider: entity.videoProvider,
      videoSource: entity.videoSource,
      duration: entity.duration,
      content: entity.content,
      position: entity.position,
      publishedAt: entity.publishedAt,
      status: entity.status,
      isPreview: entity.isPreview,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
