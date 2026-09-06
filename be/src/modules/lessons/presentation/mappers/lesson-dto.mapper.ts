import { Lesson } from '../../domain/entity/lesson.entity';

export class LessonDtoMapper {
  static toDto(lesson: Lesson) {
    return {
      id: String(lesson.id),
      title: lesson.title,
      slug: lesson.slug,
      type: lesson.type,
      duration: lesson.duration,
      position: lesson.position,
      isPreview: lesson.isPreview,
    };
  }

  static toDetailDto(lesson: Lesson, signedVideoUrl: string | null = null) {
    return {
      id: lesson.id,
      sectionId: lesson.sectionId,
      title: lesson.title,
      slug: lesson.slug,
      type: lesson.type,
      videoProvider: lesson.videoProvider,
      videoSource: signedVideoUrl,
      duration: lesson.duration,
      content: lesson.content,
      position: lesson.position,
      isPreview: lesson.isPreview,
      status: lesson.status,
    };
  }

  static toDtoList(lessons: Lesson[] = []) {
    return lessons.map((lesson) => LessonDtoMapper.toDto(lesson));
  }
}
