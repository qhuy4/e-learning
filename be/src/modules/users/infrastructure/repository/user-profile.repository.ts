import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserProfileOrmEntity } from '@/modules/users/domain/entity/user-profile.orm.entity';

@Injectable()
export class UserProfileRepository {
  constructor(
    @InjectRepository(UserProfileOrmEntity)
    private readonly repository: Repository<UserProfileOrmEntity>,
  ) {}

  async findByUserId(userId: number): Promise<UserProfileOrmEntity | null> {
    return this.repository.findOne({
      where: {
        userId,
      },
    });
  }
}
