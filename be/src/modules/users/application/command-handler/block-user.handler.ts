import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlockUserCommand } from '@/modules/users/application/command/block-user.command';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';

@CommandHandler(BlockUserCommand)
export class BlockUserCommandHandler implements ICommandHandler<BlockUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: BlockUserCommand) {
    const { reason, id } = command.data;
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    user.block(reason);
    await this.userRepository.save(user);
  }
}
