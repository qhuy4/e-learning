import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Logger } from '@nestjs/common';

import { UpdateInstructorProfileCommand } from '@/modules/users/application/command/update-instructor-profile.command';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { UserProfile } from '@/modules/users/domain/entity/user-profile.entity';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(UpdateInstructorProfileCommand)
export class UpdateInstructorProfileHandler
  implements ICommandHandler<UpdateInstructorProfileCommand>
{
  private readonly logger = new Logger(UpdateInstructorProfileHandler.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateInstructorProfileCommand) {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const { name, profile, avatar } = command.data;

    if (name !== undefined) {
      user.update({ name });
    }

    if (profile) {
      const profileData: Record<string, any> = { ...profile };

      if (avatar) {
        profileData.avatarUrl = `/storage/img/${avatar.filename}`;
      }

      if (user.profile) {
        user.profile.update(profileData);
      } else {
        user.profile = UserProfile.create({
          userId: user.id!,
          ...profileData,
        });
      }
    }

    return this.userRepository.save(user);
  }
}
