import { UserRole } from '../../domain/enum/user.role';

export class ChangeUserRoleCommand {
  constructor(
    public readonly data: {
      userId: number;
      role: UserRole;
    },
  ) {}
}
