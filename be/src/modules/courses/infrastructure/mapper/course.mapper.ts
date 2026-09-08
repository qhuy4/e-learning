import { Course } from '@/modules/courses/domain/entity/course.entity';
import { Section } from '@/modules/sections/domain/entity/section.entity';
import { Lesson } from '@/modules/lessons/domain/entity/lesson.entity';
import { LessonType } from '@/modules/lessons/domain/enums/lesson-type.enum';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';

export class CourseMapper {
  static toDomain(entity: CourseOrmEntity): Course {
    return Course.restore({
      id: Number(entity.id),
      instructorId: Number(entity.instructorId),
      title: entity.title,
      slug: entity.slug,
      description: entity.description,
      thumbnail: entity.thumbnail,
      level: entity.level,
      price: Number(entity.price),
      status: entity.status,
      reviewedBy: entity.reviewedBy ? Number(entity.reviewedBy) : null,
      reviewedAt: entity.reviewedAt,
      publishedAt: entity.publishedAt,
      rejectReason: entity.rejectReason,
      parentId: entity.parentId ? Number(entity.parentId) : null,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,

      sections: (entity.sections ?? []).map((sectionOrm) =>
        Section.restore({
          id: Number(sectionOrm.id),
          courseId: Number(sectionOrm.courseId),
          title: sectionOrm.title,
          slug: sectionOrm.slug,
          description: sectionOrm.description,
          position: sectionOrm.position,
          isActive: sectionOrm.isActive,
          createdAt: sectionOrm.createdAt,
          updatedAt: sectionOrm.updatedAt,
          deletedAt: sectionOrm.deletedAt,

          lessons: (sectionOrm.lessons ?? []).map((lessonOrm) =>
            Lesson.restore({
              id: Number(lessonOrm.id),
              sectionId: Number(lessonOrm.sectionId),
              title: lessonOrm.title,
              slug: lessonOrm.slug,
              type: lessonOrm.type as LessonType,
              videoProvider: lessonOrm.videoProvider ?? null,
              videoSource: lessonOrm.videoSource ?? null,
              content: lessonOrm.content ?? null,
              publishedAt: lessonOrm.publishedAt ?? null,
              status: lessonOrm.status ?? 1,
              duration: lessonOrm.duration,
              position: lessonOrm.position,
              isPreview: lessonOrm.isPreview,
              createdAt: lessonOrm.createdAt,
              updatedAt: lessonOrm.updatedAt,
              deletedAt: lessonOrm.deletedAt,
            }),
          ),
        }),
      ),
    });
  }
}
