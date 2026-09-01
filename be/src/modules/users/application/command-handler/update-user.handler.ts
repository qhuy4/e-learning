import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';

import { UpdateUserCommand } from '../command/update-user.command';
import { UserRepository } from '../../infrastructure/repository/user.repository';

import { PasswordService } from '@/common/service/password.service';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { UserProfile } from '@/modules/users/domain/entity/user-profile.entity';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: UpdateUserCommand) {
    const user = await this.userRepository.findById(command.id);

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const { name, email, password, profile, role } = command.data;
    const avatar = command.data.avatarUrl;
    if (email !== undefined && email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser && existingUser.id !== user.id) {
        throw new AppException(
          ErrorCode.EMAIL_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        );
      }
    }

    let hashedPassword: string | undefined;

    if (password !== undefined) {
      hashedPassword = await this.passwordService.hash(password);
    }

    user.update({
      name,
      email,
      password: hashedPassword,
      role,
    });
    if (profile) {
      const profileData = {
        ...profile,
        ...(avatar && {
          avatarUrl: `/storage/img/${avatar.filename}`,
        }),
      };

      if (user.profile) {
        user.profile.update(profileData);
      } else {
        if (!user.id) {
          throw new Error('User id is required');
        }

        user.profile = UserProfile.create({
          userId: user.id,
          ...profileData,
        });
      }
    }
    return this.userRepository.save(user);
  }
}
