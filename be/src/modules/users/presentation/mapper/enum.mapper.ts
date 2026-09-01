import { UserRole } from '@/modules/users/domain/enum/user.role';
import { Gender } from '@/modules/users/domain/enum/user.gender';
import { UserStatus } from '@/modules/users/domain/enum/user.status';

export const UserRoleApi  = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
} as const;

export type UserRoleApi =
  (typeof UserRoleApi )[keyof typeof UserRoleApi ];

export const UserStatusApi  = {
  BLOCKED: 'BLOCKED',
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
} as const;

export type UserStatusApi  =
  (typeof UserStatusApi )[keyof typeof UserStatusApi ];

export const GenderApi = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export type GenderApi =
  (typeof GenderApi)[keyof typeof GenderApi];

export function mapUserRole(role: UserRole): UserRoleApi {
  switch (role) {
    case UserRole.ADMIN:
      return UserRoleApi.ADMIN;

    case UserRole.INSTRUCTOR:
      return UserRoleApi.INSTRUCTOR;

    case UserRole.STUDENT:
      return UserRoleApi.STUDENT;

    default:
      throw new Error(`Unknown user role: ${role}`);
  }
}

export function mapUserStatus(status: UserStatus): UserStatusApi {
  switch (status) {
    case UserStatus.BLOCKED:
      return UserStatusApi.BLOCKED;

    case UserStatus.ACTIVE:
      return UserStatusApi.ACTIVE;

    case UserStatus.PENDING:
      return UserStatusApi.PENDING;

    default:
      throw new Error(`Unknown user status: ${status}`);
  }
}

export function mapGender(gender: Gender): GenderApi {
  switch (gender) {
    case Gender.MALE:
      return GenderApi.MALE;

    case Gender.FEMALE:
      return GenderApi.FEMALE;

    case Gender.OTHER:
      return GenderApi.OTHER;

    default:
      throw new Error(`Unknown gender: ${gender}`);
  }
}
export function mapGenderToDomain(gender: GenderApi): Gender {
  switch (gender) {
    case GenderApi.MALE:
      return Gender.MALE;

    case GenderApi.FEMALE:
      return Gender.FEMALE;

    case GenderApi.OTHER:
      return Gender.OTHER;

    default:
      throw new Error(`Unknown gender: ${gender}`);
  }
}
export function mapUserRoleToDomain(role: UserRoleApi): UserRole {
  switch (role) {
    case UserRoleApi.ADMIN:
      return UserRole.ADMIN;

    case UserRoleApi.INSTRUCTOR:
      return UserRole.INSTRUCTOR;

    case UserRoleApi.STUDENT:
      return UserRole.STUDENT;

    default:
      throw new Error(`Unknown user role: ${role}`);
  }
}

export function mapUserStatusToDomain(
  status: UserStatusApi,
): UserStatus {
  switch (status) {
    case UserStatusApi.BLOCKED:
      return UserStatus.BLOCKED;

    case UserStatusApi.ACTIVE:
      return UserStatus.ACTIVE;

    case UserStatusApi.PENDING:
      return UserStatus.PENDING;

    default:
      throw new Error(`Unknown user status: ${status}`);
  }
}