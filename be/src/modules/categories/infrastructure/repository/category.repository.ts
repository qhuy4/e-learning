import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { CategoryOrmEntity } from '@/modules/categories/infrastructure/entity/category.orm-entity';
import { CategoryCourseOrmEntity } from '@/modules/categories/infrastructure/entity/category-course.orm-entity';
import { ICategoryRepository } from '@/modules/categories/domain/repository/category.repository';
import { CategoryMapper } from '@/modules/categories/infrastructure/mapper/category.mapper';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repository: Repository<CategoryOrmEntity>,
    @InjectRepository(CategoryCourseOrmEntity)
    private readonly categoryCourseRepository: Repository<CategoryCourseOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    parentId?: number | null;
    getAll?: boolean;
  }) {
    const { page, limit, keyword, parentId, getAll } = options;

    const query = this.repository
      .createQueryBuilder('cat')
      .leftJoinAndSelect('cat.children', 'children');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('cat.name ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('cat.slug ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        query.andWhere('cat.parent_id IS NULL');
      } else {
        query.andWhere('cat.parent_id = :parentId', { parentId });
      }
    }

    query.orderBy('cat.name', 'ASC');

    if (!getAll) {
      query.skip((page - 1) * limit).take(limit);
    }

    const [entities, total] = await query.getManyAndCount();

    const data = await Promise.all(
      entities.map(async (e) => {
        const courseCount = await this.categoryCourseRepository
          .createQueryBuilder('cc')
          .where('cc.category_id = :id', { id: e.id })
          .getCount();
        const domain = CategoryMapper.toDomain(e, courseCount);
        if (domain.children) {
          domain.children = await Promise.all(
            domain.children.map(async (child) => {
              const childCount = await this.categoryCourseRepository
                .createQueryBuilder('cc')
                .where('cc.category_id = :id', { id: child.id })
                .getCount();
              return { ...child, courseCount: childCount };
            }),
          );
        }
        return domain;
      }),
    );

    return {
      data,
      meta: {
        page: getAll ? 1 : page,
        limit: getAll ? total : limit,
        total,
        totalPages: getAll ? 1 : Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: { children: true, parent: true },
    });
    if (!entity) return null;

    // Count courses directly in this category
    const courseCountResult = await this.categoryCourseRepository
      .createQueryBuilder('cc')
      .where('cc.category_id = :id', { id: id.toString() })
      .getCount();

    const domain = CategoryMapper.toDomain(entity, courseCountResult);

    // Count courses for each child
    if (entity.children && entity.children.length > 0) {
      domain.children = await Promise.all(
        entity.children.map(async (child) => {
          const childCount = await this.categoryCourseRepository
            .createQueryBuilder('cc')
            .where('cc.category_id = :id', { id: child.id })
            .getCount();
          return {
            id: Number(child.id),
            name: child.name,
            slug: child.slug,
            parentId: child.parentId ? Number(child.parentId) : null,
            courseCount: childCount,
          };
        }),
      );
    }

    return domain;
  }

  async findBySlug(slug: string) {
    const entity = await this.repository.findOne({
      where: { slug },
      relations: { children: true, parent: true },
    });
    if (!entity) return null;
    return CategoryMapper.toDomain(entity);
  }

  async create(data: Partial<CategoryOrmEntity>) {
    const entity = this.repository.create(data);
    const saved = await this.repository.save(entity);
    return this.findById(Number(saved.id));
  }

  async update(id: number, data: Partial<CategoryOrmEntity>) {
    await this.repository.update(id.toString(), data);
    return this.findById(id);
  }

  async delete(id: number) {
    // Move children to parent before delete
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
    });
    if (entity?.parentId) {
      await this.repository.update(
        { parentId: id.toString() },
        { parentId: entity.parentId },
      );
    } else {
      await this.repository.update(
        { parentId: id.toString() },
        { parentId: null },
      );
    }
    await this.repository.delete(id.toString());
  }
}
