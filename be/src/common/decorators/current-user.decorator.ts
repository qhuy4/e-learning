import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserStatus } from '@/modules/users/domain/enum/user.status';
import { UserRole } from '@/modules/users/domain/enum/user.role';

/** Shape of `request.user` set by `JwtStrategy.validate()`. */
export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  status: UserStatus;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
