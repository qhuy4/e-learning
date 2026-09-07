import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateUserCommand } from '@/modules/users/application/command/create-user.command';
import { User } from '@/modules/users/domain/entity/user.entity';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';

import { PasswordService } from '@/common/service/password.service';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: CreateUserCommand) {
    const { name, email, password, role, status } = command.data;
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppException(
        ErrorCode.EMAIL_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await this.passwordService.hash(password);

    const user = User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status,
    });
    return this.userRepository.create(user);
  }
}
