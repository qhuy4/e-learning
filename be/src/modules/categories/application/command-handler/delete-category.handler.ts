import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteCategoryCommand } from '@/modules/categories/application/command/delete-category.command';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '@/modules/categories/domain/repository/category.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: DeleteCategoryCommand) {
    const existing = await this.categoryRepository.findById(command.data.id);
    if (!existing) {
      throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, 404);
    }

    await this.categoryRepository.delete(command.data.id);
  }
}
