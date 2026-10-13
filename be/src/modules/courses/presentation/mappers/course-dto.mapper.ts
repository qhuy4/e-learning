import { Course } from '@/modules/courses/domain/entity/course.entity';
import { CourseDetailResponseDto } from '@/modules/courses/presentation/dto/course-detail-response.dto';
import { resolveSignedUrl } from '@/modules/courses/presentation/dto/course-response.dto';
import { SectionDtoMapper } from '@/modules/sections/presentation/mappers/section-dto.mapper';
import { FileStorage } from '@/common/storage/domain/interface/file-storage.interface';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';

export class CourseDtoMapper {
  static async toDetailDto(
    courseOrEntity: Course | CourseOrmEntity,
    storage?: FileStorage,
  ): Promise<CourseDetailResponseDto> {
    const dto = new CourseDetailResponseDto();

    dto.id = Number(courseOrEntity.id);
    dto.instructorId = Number(courseOrEntity.instructorId);
    dto.title = courseOrEntity.title;
    dto.slug = courseOrEntity.slug;
    dto.description = courseOrEntity.description;

    dto.thumbnail = storage
      ? await resolveSignedUrl(courseOrEntity.thumbnail, storage)
      : courseOrEntity.thumbnail;
    dto.level = Number(courseOrEntity.level);
    dto.price = Number(courseOrEntity.price);
    dto.publishedAt = courseOrEntity.publishedAt;
    dto.createdAt = courseOrEntity.createdAt;

    const ormEntity = courseOrEntity as CourseOrmEntity;
    const instructorUser = (ormEntity as any).instructorUser as
      UserOrmEntity | undefined;
    const instructorProfile = (ormEntity as any).instructorProfile;

    if (instructorUser) {
      dto.instructor = {
        id: instructorProfile?.id ?? 0,
        userId: instructorUser.id,
        name: instructorUser.name ?? null,
        avatar: ((instructorUser as any).profile?.avatarUrl as string | null) ?? null,
        headline: instructorProfile?.headline ?? null,
        bio: instructorProfile?.bio ?? null,
        websiteUrl: instructorProfile?.websiteUrl ?? null,
        socialLinks: instructorProfile?.socialLinks ?? null,
      };
    } else {
      dto.instructor = null;
    }

    dto.statistics = {
      studentCount: 0,
      averageRating: 0,
      reviewCount: 0,
    };

    dto.sections = SectionDtoMapper.toDtoList(
      (courseOrEntity as any).sections ?? [],
    );

    return dto;
  }
}
