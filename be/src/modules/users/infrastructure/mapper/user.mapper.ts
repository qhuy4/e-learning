import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { User } from '@/modules/users/domain/entity/user.entity';
import { UserProfileMapper } from '@/modules/users/infrastructure/mapper/user-profile.mapper';

export class UserMapper {
  static toDomain(entity: UserOrmEntity): User {
    return User.restore({
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      status: entity.status,
      role: entity.role,
      blockReason: entity.block_reason,
      blockedAt: entity.blocked_at,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      deletedAt: entity.deleted_at,
      profile: entity.profile
        ? UserProfileMapper.toDomain(entity.profile)
        : null,
    });
  }

  static toPersistence(domain: User): UserOrmEntity {
    const entity = new UserOrmEntity();

    if (domain.id !== null) {
      entity.id = domain.id;
    }
    entity.name = domain.name;
    entity.email = domain.email;
    entity.password = domain.password;
    entity.status = domain.status;
    entity.role = domain.role;
    entity.block_reason = domain.blockReason;
    entity.blocked_at = domain.blockedAt;
    entity.created_at = domain.createdAt ?? new Date();
    entity.updated_at = domain.updatedAt ?? new Date();
    entity.deleted_at = domain.deletedAt;
    entity.profile = domain.profile
      ? UserProfileMapper.toPersistence(domain.profile)
      : null;
    return entity;
  }
}
