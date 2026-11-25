import { Repository, In } from 'typeorm';
import { Course } from '@/modules/courses/domain/entity/course.entity';
import { AdminCourseDetailResponseDto } from '@/modules/courses/presentation/dto/admin-course-detail-response.dto';
import { FileStorage } from '@/common/storage/domain/interface/file-storage.interface';
import { resolveSignedUrl } from '@/modules/courses/presentation/dto/course-response.dto';
import { CategoryCourseOrmEntity } from '@/modules/categories/infrastructure/entity/category-course.orm-entity';
import { CategoryOrmEntity } from '@/modules/categories/infrastructure/entity/category.orm-entity';

export class AdminCourseDtoMapper {
  static async toDetailDto(
    course: Course,
    storage: FileStorage,
    categoryCourseRepo?: Repository<CategoryCourseOrmEntity>,
    categoryRepo?: Repository<CategoryOrmEntity>,
  ): Promise<AdminCourseDetailResponseDto> {
    const dto = new AdminCourseDetailResponseDto();

    dto.id = String(course.id);
    dto.instructorId = String(course.instructorId);
    dto.title = course.title;
    dto.slug = course.slug;
    dto.description = course.description;

    dto.thumbnail = await resolveSignedUrl(course.thumbnail, storage);

    dto.level = Number(course.level);
    dto.cefrLevelStart = course.cefrLevelStart;
    dto.cefrLevelEnd = course.cefrLevelEnd;
    dto.skillCodes = course.skillCodes;
    dto.price = Number(course.price);
    dto.status = course.status;
    dto.rejectReason = course.rejectReason;
    dto.reviewedBy = course.reviewedBy ? String(course.reviewedBy) : null;
    dto.reviewedAt = course.reviewedAt;
    dto.publishedAt = course.publishedAt;
    dto.version = course.version;
    dto.parentId = course.parentId ? String(course.parentId) : null;
    dto.createdAt = course.createdAt;
    dto.updatedAt = course.updatedAt;
    dto.deletedAt = course.deletedAt;

    dto.instructor = null;
    dto.statistics = {
      studentCount: 0,
      averageRating: 0,
      reviewCount: 0,
    };

    dto.sections = await Promise.all(
      (course.sections ?? []).map(async (section) => ({
        id: String(section.id),
        title: section.title,
        slug: section.slug,
        description: section.description,
        position: section.position,
        isActive: section.isActive,
        createdAt: section.createdAt,
        deletedAt: section.deletedAt,

        lessons: await Promise.all(
          (section.lessons ?? []).map(async (lesson) => ({
            id: String(lesson.id),
            title: lesson.title,
            slug: lesson.slug,
            type: lesson.type,
            duration: lesson.duration,
            position: lesson.position,
            isPreview: lesson.isPreview,
            videoUrl: await resolveSignedUrl(lesson.videoSource, storage),
            content: lesson.content ?? null,
            isActive: lesson.status === 1,
            createdAt: lesson.createdAt,
            deletedAt: lesson.deletedAt,
          })),
        ),
      })),
    );

    dto.categories = [];
    if (categoryCourseRepo && categoryRepo && course.id) {
      const ccRows = await categoryCourseRepo.find({
        where: { courseId: course.id.toString() },
      });
      if (ccRows.length > 0) {
        const catIds = ccRows.map((r) => r.categoryId);
        const cats = await categoryRepo.find({ where: { id: In(catIds) } });
        dto.categories = cats.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }));
      }
    }

    return dto;
  }
}
