import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminCategoryByIdQuery } from '@/modules/categories/application/query/get-admin-category-by-id.query';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '@/modules/categories/domain/repository/category.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

@QueryHandler(GetAdminCategoryByIdQuery)
export class GetAdminCategoryByIdHandler implements IQueryHandler<GetAdminCategoryByIdQuery> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: GetAdminCategoryByIdQuery) {
    const category = await this.categoryRepository.findById(query.data.id);
    if (!category) {
      throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, 404);
    }
    return category;
  }
}
