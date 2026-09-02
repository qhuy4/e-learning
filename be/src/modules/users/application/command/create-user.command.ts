import { UserRole } from '@/modules/users/domain/enum/user.role';
import { UserStatus } from '@/modules/users/domain/enum/user.status';

export class CreateUserCommand {
  constructor(
    public readonly data: {
      name: string;
      email: string;
      password: string;
      role: UserRole | undefined;
      status: UserStatus | undefined;
    },
  ) {}
}