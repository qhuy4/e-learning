import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '@/modules/users/domain/entity/user.orm-entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.repository.findOne({
      where: {
        email,
      },
    });
  }
  async findById(id: number) {
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }
}
