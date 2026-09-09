import { UserRole } from '@/modules/users/domain/enum/user.role';

export class ChangeUserRoleCommand {
  constructor(
    public readonly data: {
      userId: number;
      role: UserRole;
    },
  ) {}
}
