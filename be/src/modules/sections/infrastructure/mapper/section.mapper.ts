import { Section } from '../../domain/entity/section.entity';
import { SectionOrmEntity } from '../entity/section.orm-entity';

export class SectionMapper {
  static toDomain(entity: SectionOrmEntity): Section {
    return Section.restore({
      id: Number(entity.id),
      courseId: Number(entity.courseId),
      title: entity.title,
      slug: entity.slug,
      description: entity.description,
      position: entity.position,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
