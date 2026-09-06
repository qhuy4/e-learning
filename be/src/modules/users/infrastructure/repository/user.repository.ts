import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { IUserRepository } from '@/modules/users/domain/repository/user.repository';
import { User } from '@/modules/users/domain/entity/user.entity';
import { UserMapper } from '@/modules/users/infrastructure/mapper/user.mapper';

export interface FindUsersOptions {
  page: number;
  limit: number;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: number;
}

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
      relations: {
        profile: true,
      },
    });

    if (!entity) {
      return null;
    }

    return UserMapper.toDomain(entity);
  }

  async save(user: User): Promise<User> {
    const entity = UserMapper.toPersistence(user);

    try {
      const savedEntity = await this.repository.save(entity);

      return UserMapper.toDomain(savedEntity);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async delete(user: User): Promise<void> {
    if (user.id === null) {
      throw new Error('Cannot delete user without id');
    }

    await this.repository.softDelete(user.id);
  }

  async create(user: User): Promise<User> {
    const entity = UserMapper.toPersistence(user);

    const savedEntity = await this.repository.save(entity);

    return UserMapper.toDomain(savedEntity);
  }

  async findAll(
    options: FindUsersOptions,
  ): Promise<{ users: User[]; total: number }> {
    const { page, limit, keyword, sortBy, sortOrder, role } = options;
    const query = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .addSelect([
        'profile.id',
        'profile.avatar_url',
        'profile.first_name',
        'profile.last_name',
      ]);

    if (role !== undefined && role !== null) {
      query.andWhere('user.role = :role', { role });
    }

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('user.email ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    const sortableColumns: Record<string, string> = {
      name: 'user.name',
      email: 'user.email',
      role: 'user.role',
      status: 'user.status',
      createdAt: 'user.created_at',
    };

    const sortColumn =
      sortBy && sortableColumns[sortBy]
        ? sortableColumns[sortBy]
        : 'user.created_at';

    const sortDirection: 'ASC' | 'DESC' =
      sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortColumn, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      users: entities.map((entity) => UserMapper.toDomain(entity)),
      total,
    };
  }
}
