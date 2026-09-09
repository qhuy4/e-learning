import { Course } from '@/modules/courses/domain/entity/course.entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { FileStorage } from '@/common/storage/domain/interface/file-storage.interface';

const DOWNLOAD_EXPIRES_IN = 600;

function resolveThumbnailKey(thumbnail: string | null): string | null {
  if (!thumbnail) return null;

  if (thumbnail.startsWith('http')) return null;
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
  parentId: string | null;
  version: number | null;

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
    dto.parentId = entity.parentId;
    dto.version = entity.version;
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
    dto.parentId = course.parentId ? String(course.parentId) : null;

    return dto;
  }
}

/**
 * Tạo signed URL từ R2 storage key.
 * - Key lưu trong DB: "courses/thumbnails/xxx.jpg"
 * - Trả về: signed URL có thời hạn (600s theo config)
 * - Nếu là URL đầy đủ rồi: trả về nguyên
 * - Nếu null: trả về null
 */
export async function resolveSignedUrl(
  thumbnail: string | null,
  storage: FileStorage,
): Promise<string | null> {
  const key = resolveThumbnailKey(thumbnail);
  if (!key) return thumbnail; // null hoặc đã là full URL

  try {
    return await storage.createDownloadUrl({
      key,
      expiresIn: DOWNLOAD_EXPIRES_IN,
    });
  } catch {
    // Nếu R2 fail, trả về null thay vì crash
    return null;
  }
}
