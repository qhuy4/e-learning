import { UpdateUserDto } from '@/modules/users/presentation/dto/common/update-user.dto';
import { UpdateUserCommand } from '@/modules/users/application/command/update-user.command';
import {
  mapGenderToDomain,
  mapUserRoleToDomain,
  mapUserStatusToDomain,
} from '@/modules/users/presentation/mapper/enum.mapper';

export class UpdateUserCommandMapper {
  static toCommand(
    id: number,
    dto: UpdateUserDto,
    avatarUrl?: Express.Multer.File,
  ): UpdateUserCommand {
    return new UpdateUserCommand(id, {
      name: dto.name,
      email: dto.email,
      password: dto.password,

      status: dto.status ? mapUserStatusToDomain(dto.status) : undefined,

      role: dto.role ? mapUserRoleToDomain(dto.role) : undefined,
      avatarUrl,
      profile: dto.profile
        ? {
            ...dto.profile,
            gender: dto.profile.gender
              ? mapGenderToDomain(dto.profile.gender)
              : undefined,
          }
        : undefined,
    });
  }
}
