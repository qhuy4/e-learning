import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';
import { UnblockUserCommand } from '@/modules/users/application/command/unblock-user.command';

@CommandHandler(UnblockUserCommand)
export class UnBlockUserCommandHandler implements ICommandHandler<UnblockUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UnblockUserCommand) {
    const { userId } = command.data;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    user.unblock();
    await this.userRepository.save(user);
  }
}
