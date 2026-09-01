import { UserStatus } from '@/modules/users/domain/enum/user.status';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { UserProfile } from '@/modules/users/domain/entity/user-profile.entity';

export class User {
  private constructor(
    public id: number | null,
    public name: string,
    public email: string,
    public password: string,
    public status: UserStatus,
    public role: UserRole,
    public blockReason: string | null,
    public blockedAt: Date | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public deletedAt: Date | null,
    public profile: UserProfile | null,
  ) {}

  static create(params: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    status?: UserStatus;
  }): User {
    return new User(
      null,
      params.name,
      params.email,
      params.password,
      params.status ?? UserStatus.PENDING,
      params.role ?? UserRole.STUDENT,
      null,
      null,
      null,
      null,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    name: string;
    email: string;
    password: string;
    status: UserStatus;
    role: UserRole;
    blockReason: string | null;
    blockedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    profile: UserProfile | null;
  }): User {
    return new User(
      params.id,
      params.name,
      params.email,
      params.password,
      params.status,
      params.role,
      params.blockReason,
      params.blockedAt,
      params.createdAt,
      params.updatedAt,
      params.deletedAt,
      params.profile,
    );
  }

  update(params: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
  }): void {
    if (params.name !== undefined) {
      this.name = params.name;
    }

    if (params.email !== undefined) {
      this.email = params.email;
    }

    if (params.password !== undefined) {
      this.password = params.password;
    }

    if (params.role !== undefined) {
      this.role = params.role;
    }
    this.updatedAt = new Date();
  }

  block(reason: string): void {
    this.status = UserStatus.BLOCKED;
    this.blockReason = reason;
    this.blockedAt = new Date();
  }

  unblock(): void {
    this.status = UserStatus.ACTIVE;
    this.blockReason = null;
    this.blockedAt = null;
  }
}
