import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../domain/enum/user.role';
import { UserStatus } from '../../../domain/enum/user.status';
import {
  UserRoleApi,
  UserStatusApi,
} from '@/modules/users/presentation/mapper/enum.mapper';

export function mapUserRoleFromApi(role: UserRoleApi): UserRole {
  switch (role) {
    case UserRoleApi.ADMIN:
      return UserRole.ADMIN;

    case UserRoleApi.INSTRUCTOR:
      return UserRole.INSTRUCTOR;

    case UserRoleApi.STUDENT:
      return UserRole.STUDENT;
  }
}

export function mapUserStatusFromApi(status: UserStatusApi): UserStatus {
  switch (status) {
    case UserStatusApi.PENDING:
      return UserStatus.PENDING;

    case UserStatusApi.ACTIVE:
      return UserStatus.ACTIVE;

    case UserStatusApi.BLOCKED:
      return UserStatus.BLOCKED;
  }
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserRoleApi)
  role?: UserRoleApi;

  @IsOptional()
  @IsEnum(UserStatusApi)
  status?: UserStatusApi;
}
