import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateCategoryCommand } from '@/modules/categories/application/command/update-category.command';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '@/modules/categories/domain/repository/category.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: UpdateCategoryCommand) {
    const { id, ...data } = command.data;

    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, 404);
    }

    if (data.slug) {
      const slugExist = await this.categoryRepository.findBySlug(data.slug);
      if (slugExist && slugExist.id !== id) {
        throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTS, 409);
      }
    }

    if (data.parentId === id) {
      throw new AppException(ErrorCode.CATEGORY_CANNOT_PARENT_SELF, 400);
    }

    if (data.parentId) {
      const parent = await this.categoryRepository.findById(data.parentId);
      if (!parent) {
        throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, 404);
      }
    }

    return this.categoryRepository.update(id, data);
  }
}
