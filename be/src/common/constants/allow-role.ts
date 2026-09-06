import { UserRole } from '@/modules/users/domain/enum/user.role';

export const ADMIN_LOGIN_ROLES = [UserRole.ADMIN] as const;

export const INSTRUCTOR_LOGIN_ROLES = [UserRole.INSTRUCTOR] as const;

export const USER_LOGIN_ROLES = [UserRole.STUDENT] as const;
