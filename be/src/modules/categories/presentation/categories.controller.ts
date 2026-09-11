import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CategoryOrmEntity } from '@/modules/categories/infrastructure/entity/category.orm-entity';

@Controller('categories')
export class CategoriesController {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly categoryRepo: Repository<CategoryOrmEntity>,
  ) {}

  @Get()
  async findAll(@Query('keyword') keyword?: string) {
    const query = this.categoryRepo
      .createQueryBuilder('cat')
      .select(['cat.id', 'cat.name', 'cat.slug', 'cat.parentId'])
      .where('cat.parentId IS NULL')
      .orderBy('cat.name', 'ASC');

    if (keyword) {
      query.andWhere('cat.name ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    const parents = await query.getMany();

    const result = await Promise.all(
      parents.map(async (parent) => {
        const children = await this.categoryRepo.find({
          where: { parentId: parent.id },
          order: { name: 'ASC' },
          select: { id: true, name: true, slug: true },
        });
        return {
          id: parent.id,
          name: parent.name,
          slug: parent.slug,
          children: children.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
        };
      }),
    );

    return { data: result };
  }
}
