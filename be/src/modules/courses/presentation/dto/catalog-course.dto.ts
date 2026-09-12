import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { FileStorage } from '@/common/storage/domain/interface/file-storage.interface';
import { resolveSignedUrl } from './course-response.dto';

export class CatalogCourseDto {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  level: number;
  price: number;
  instructorName: string | null;
  instructorAvatar: string | null;
  avgRating: number;
  reviewCount: number;

  static async fromEntity(
    entity: CourseOrmEntity,
    storage: FileStorage,
    avgRating: number,
    reviewCount: number,
  ): Promise<CatalogCourseDto> {
    const dto = new CatalogCourseDto();

    dto.id = Number(entity.id);
    dto.title = entity.title;
    dto.slug = entity.slug;
    dto.thumbnail = await resolveSignedUrl(entity.thumbnail, storage);
    dto.level = Number(entity.level);
    dto.price = Number(entity.price);
    dto.avgRating = Math.round(avgRating * 10) / 10;
    dto.reviewCount = reviewCount;

    if (entity.instructorUser) {
      dto.instructorName = entity.instructorUser.name;
      const profile = (entity.instructorUser as any).profile;
      dto.instructorAvatar = profile?.avatarUrl ?? null;
    } else {
      dto.instructorName = null;
      dto.instructorAvatar = null;
    }

    return dto;
  }
}
