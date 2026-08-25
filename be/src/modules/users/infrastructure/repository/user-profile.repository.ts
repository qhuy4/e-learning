import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserProfileOrmEntity } from '@/modules/users/infrastructure/entity/user-profile.orm.entity';
import { IUserProfileRepository } from '@/modules/users/domain/repository/user-profile.repository';
import { UserProfileMapper } from '@/modules/users/infrastructure/mapper/user-profile.mapper';
import { UserProfile } from '@/modules/users/domain/entity/user-profile.entity';

@Injectable()
export class UserProfileRepository implements IUserProfileRepository {
  constructor(
    @InjectRepository(UserProfileOrmEntity)
    private readonly repository: Repository<UserProfileOrmEntity>,
  ) {}

  async findByUserId(userId: number): Promise<UserProfile | null> {
    const entity = await this.repository.findOne({ where: { userId } });
    if (!entity) {
      return null;
    }
    return UserProfileMapper.toDomain(entity);
  }

  async create(userProfile: UserProfile): Promise<UserProfile> {
    const entity = UserProfileMapper.toPersistence(userProfile);

    const savedEntity = await this.repository.save(entity);

    return UserProfileMapper.toDomain(savedEntity);
  }
}
