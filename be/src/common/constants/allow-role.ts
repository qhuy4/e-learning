import { UserRole } from '@/modules/users/domain/enum/user.role';

export const ADMIN_LOGIN_ROLES = [UserRole.ADMIN, UserRole.INSTRUCTOR] as const;

export const USER_LOGIN_ROLES = [UserRole.STUDENT] as const;
