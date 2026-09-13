import { CategoryOrmEntity } from '@/modules/categories/infrastructure/entity/category.orm-entity';

export class CategoryMapper {
  static toDomain(entity: CategoryOrmEntity, courseCount?: number) {
    return {
      id: Number(entity.id),
      name: entity.name,
      slug: entity.slug,
      parentId: entity.parentId ? Number(entity.parentId) : null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      children: entity.children?.map((c) => ({
        id: Number(c.id),
        name: c.name,
        slug: c.slug,
        parentId: c.parentId ? Number(c.parentId) : null,
      })),
      courseCount: courseCount ?? 0,
    };
  }
}
