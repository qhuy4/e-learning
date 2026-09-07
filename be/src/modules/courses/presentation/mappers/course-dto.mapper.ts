import { Course } from '@/modules/courses/domain/entity/course.entity';
import { CourseDetailResponseDto } from '@/modules/courses/presentation/dto/course-detail-response.dto';

export class CourseDtoMapper {
  static async toDetailDto(
    course: Course,
    storage?: FileStorage,
  ): Promise<CourseDetailResponseDto> {
    const dto = new CourseDetailResponseDto();

    dto.id = String(course.id);
    dto.instructorId = String(course.instructorId);
    dto.title = course.title;
    dto.slug = course.slug;
    dto.description = course.description;

    dto.thumbnail = storage
      ? await resolveSignedUrl(course.thumbnail, storage)
      : course.thumbnail;
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

    dto.sections = SectionDtoMapper.toDtoList(course.sections ?? []);

    return dto;
  }
}
