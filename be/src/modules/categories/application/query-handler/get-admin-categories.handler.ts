import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminCategoriesQuery } from '@/modules/categories/application/query/get-admin-categories.query';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '@/modules/categories/domain/repository/category.repository';

@QueryHandler(GetAdminCategoriesQuery)
export class GetAdminCategoriesHandler implements IQueryHandler<GetAdminCategoriesQuery> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetAdminCategoriesQuery) {
    return this.categoryRepository.findAll(query.data);
  }
}
