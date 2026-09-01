import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { IInstructorProfileRepository } from '@/modules/instructors/domain/repository/instructor-profile.repository';

export interface FindInstructorsOptions {
  page: number;
  limit: number;
  keyword?: string;
}

@Injectable()
export class InstructorProfileRepository implements IInstructorProfileRepository {
  constructor(
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly repository: Repository<InstructorProfileTypeOrmEntity>,
  ) {}

  async findAll(options: FindInstructorsOptions): Promise<{
    instructors: InstructorProfileTypeOrmEntity[];
    total: number;
  }> {
    const { page, limit, keyword } = options;
    const query = this.repository
      .createQueryBuilder('instructor')
      .leftJoinAndSelect('instructor.user', 'user');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :keyword', {
            keyword: `%${keyword}%`,
          })
            .orWhere('user.email ILIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('instructor.headline ILIKE :keyword', {
              keyword: `%${keyword}%`,
            });
        }),
      );
    }

    query
      .orderBy('instructor.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      instructors: entities,
      total,
    };
  }
}
