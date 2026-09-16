import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

import { DeleteUserCommand } from '@/modules/users/application/command/delete-user.command';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeleteUserCommand) {
    const { id } = command.data;
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.userRepository.delete(user);
  }
}
