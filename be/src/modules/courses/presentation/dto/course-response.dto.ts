import { Course } from '../../domain/entity/course.entity';
import { CourseOrmEntity } from '../../infrastructure/entity/course.orm-entity';
import { FileStorage } from '../../../../common/storage/domain/interface/file-storage.interface';

// Download URL expires in 1 hour
const DOWNLOAD_EXPIRES_IN = 3600;

function resolveThumbnailKey(thumbnail: string | null): string | null {
  if (!thumbnail) return null;
  // If it's already a full URL (old data or external), extract the key or return as-is
  // Keys are stored as short form: "courses/thumbnails/uuid.ext"
  if (thumbnail.startsWith('http')) return null; // can't generate signed URL from full URL
  return thumbnail;
}

export class CourseResponseDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  level: number;
  price: number;
  status: number;
  publishedAt: Date | null;
  createdAt: Date | null;

  static async fromEntity(
    entity: CourseOrmEntity,
    storage: FileStorage,
  ): Promise<CourseResponseDto> {
    const dto = new CourseResponseDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.slug = entity.slug;
    dto.description = entity.description;
    dto.thumbnail = await resolveSignedUrl(entity.thumbnail, storage);
    dto.level = Number(entity.level);
    dto.price = Number(entity.price);
    dto.status = entity.status;
    dto.publishedAt = entity.publishedAt;
    dto.createdAt = entity.createdAt;

    return dto;
  }

  static async fromDomain(
    course: Course,
    storage: FileStorage,
  ): Promise<CourseResponseDto> {
    const dto = new CourseResponseDto();

    dto.id = String(course.id);
    dto.title = course.title;
    dto.slug = course.slug;
    dto.description = course.description;
    dto.thumbnail = await resolveSignedUrl(course.thumbnail, storage);
    dto.level = Number(course.level);
    dto.price = Number(course.price);
    dto.status = course.status;
    dto.publishedAt = course.publishedAt;
    dto.createdAt = course.createdAt;

    return dto;
  }
}

export async function resolveSignedUrl(
  thumbnail: string | null,
  storage: FileStorage,
): Promise<string | null> {
  const key = resolveThumbnailKey(thumbnail);
  if (!key) return thumbnail; // null or already full URL

  try {
    return await storage.createDownloadUrl({ key, expiresIn: DOWNLOAD_EXPIRES_IN });
  } catch {
    return null;
  }
}
