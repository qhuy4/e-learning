import { Course } from '@/modules/courses/domain/entity/course.entity';
import { CourseDetailResponseDto } from '@/modules/courses/presentation/dto/course-detail-response.dto';

export class CourseDtoMapper {
  static toDetailDto(course: Course): CourseDetailResponseDto {
    const dto = new CourseDetailResponseDto();

    dto.id = String(course.id);
    dto.instructorId = String(course.instructorId);
    dto.title = course.title;
    dto.slug = course.slug;
    dto.description = course.description;
    dto.thumbnail = course.thumbnail;
    dto.level = Number(course.level);
    dto.price = Number(course.price);
    dto.publishedAt = course.publishedAt;
    dto.createdAt = course.createdAt;

    dto.instructor = null;
    dto.statistics = {
      studentCount: 0,
      averageRating: 0,
      reviewCount: 0,
    };

    dto.sections = (course.sections ?? []).map((section) => ({
      id: String(section.id),
      title: section.title,
      slug: section.slug,
      description: section.description,
      position: section.position,

      lessons: (section.lessons ?? []).map((lesson) => ({
        id: String(lesson.id),
        title: lesson.title,
        slug: lesson.slug,
        type: lesson.type,
        duration: lesson.duration,
        position: lesson.position,
        isPreview: lesson.isPreview,
      })),
    }));

    return dto;
  }
}
