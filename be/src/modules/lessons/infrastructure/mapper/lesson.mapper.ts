import { Lesson } from '../../domain/entity/lesson.entity';
import { LessonOrmEntity } from '../entity/lesson.orm-entity';
import { LessonType } from '../../domain/enums/lesson-type.enum';

export class LessonMapper {
  static toDomain(entity: LessonOrmEntity): Lesson {
    return Lesson.restore({
      id: Number(entity.id),
      sectionId: Number(entity.sectionId),
      title: entity.title,
      slug: entity.slug,
      type: entity.type as LessonType,
      videoProvider: entity.videoProvider,
      videoSource: entity.videoSource,
      thumbnail: entity.thumbnail,
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
