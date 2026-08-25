import { UserRole } from '../enum/user.role';
import { UserStatus } from '../enum/user.status';

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
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
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
    );
  }

  update(params: { name?: string; email?: string; password?: string }): void {
    if (params.name !== undefined) {
      this.name = params.name;
    }

    if (params.email !== undefined) {
      this.email = params.email;
    }

    if (params.password !== undefined) {
      this.password = params.password;
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
