import { CourseOrmEntity } from '../../domain/entity/course.orm-entity';

export class CourseResponseDto {
  id: string;

  title: string;

  slug: string;

  description: string | null;

  thumbnail: string | null;

  level: number;

  price: number;

  publishedAt: Date | null;

  createdAt: Date | null;

  static fromEntity(entity: CourseOrmEntity): CourseResponseDto {
    const dto = new CourseResponseDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.slug = entity.slug;
    dto.description = entity.description;
    dto.thumbnail = entity.thumbnail;
    dto.level = Number(entity.level);
    dto.price = Number(entity.price);
    dto.publishedAt = entity.publishedAt;
    dto.createdAt = entity.createdAt;

    return dto;
  }
}
