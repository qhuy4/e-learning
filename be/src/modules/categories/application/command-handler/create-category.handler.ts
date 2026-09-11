import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCategoryCommand } from '@/modules/categories/application/command/create-category.command';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '@/modules/categories/domain/repository/category.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand) {
    const existing = await this.categoryRepository.findBySlug(command.data.slug);
    if (existing) {
      throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTS, 409);
    }

    if (command.data.parentId) {
      const parent = await this.categoryRepository.findById(command.data.parentId);
      if (!parent) {
        throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, 404);
      }
    }

    return this.categoryRepository.create({
      name: command.data.name,
      slug: command.data.slug,
      parentId: command.data.parentId ?? null,
    });
  }
}
