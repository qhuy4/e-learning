import { UserStatus } from '@/modules/users/domain/enum/user.status';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { Gender } from '@/modules/users/domain/enum/user.gender';

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: Date | null;
  occupation?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  avatarUrl?: string;
}

export class UpdateUserCommand {
  constructor(
    public readonly id: number,
    public readonly data: {
      name?: string;
      email?: string;
      password?: string;
      status?: UserStatus;
      role?: UserRole;
      avatarUrl?: Express.Multer.File;
      profile?: UpdateUserProfileData;
    },
  ) {}
}
