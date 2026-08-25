import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { IUserRepository } from '@/modules/users/domain/repository/user.repository';
import { User } from '@/modules/users/domain/entity/user.entity';
import { UserMapper } from '@/modules/users/infrastructure/mapper/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: {
        email,
      },
    });

    if (!entity) {
      return null;
    }

    return UserMapper.toDomain(entity);
  }

  async findById(id: number): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!entity) {
      return null;
    }

    return UserMapper.toDomain(entity);
  }

  async save(user: User): Promise<void> {
    const entity = UserMapper.toPersistence(user);

    await this.repository.save(entity);
  }

  async delete(user: User): Promise<void> {
    if (user.id === null) {
      throw new Error('Cannot delete user without id');
    }

    await this.repository.softDelete(user.id);
  }
}
