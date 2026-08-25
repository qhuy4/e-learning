import { UserRole } from '@/modules/users/domain/enum/user.role';

export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly allowedRoles: readonly UserRole[],
  ) {}
}
