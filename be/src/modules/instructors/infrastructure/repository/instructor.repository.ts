import { Brackets, Repository } from 'typeorm';

import { IInstructorsRepository } from '@/modules/instructors/domain/repository/instructors.repository';
import { Instructor } from '@/modules/instructors/domain/entity/instructor.entity';
import { InstructorMapper } from '@/modules/instructors/infrastructure/mapper/instructor.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { FindInstructorsOptions } from '@/modules/instructors/domain/type/find-instructors-options';

export class InstructorRepository implements IInstructorsRepository {
  constructor(
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly repository: Repository<InstructorProfileTypeOrmEntity>,
  ) {}

  async findAll(options: FindInstructorsOptions): Promise<{
    instructors: Instructor[];
    total: number;
  }> {
    const { page, limit, keyword, status, approvalStatus, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('instructor')
      .innerJoinAndSelect('instructor.user', 'user')
      .where('user.role = :role', {
        role: UserRole.INSTRUCTOR,
      });

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('user.email ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    if (status !== undefined) {
      query.andWhere('user.status = :status', {
        status,
      });
    }

    if (approvalStatus !== undefined) {
      query.andWhere('instructor.approval_status = :approvalStatus', {
        approvalStatus,
      });
    }

    const sortableColumns: Record<string, string> = {
      name: 'user.name',
      email: 'user.email',
      status: 'user.status',
      approvalStatus: 'instructor.approval_status',
      approvedAt: 'instructor.approved_at',
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
      instructors: entities.map((entity) => InstructorMapper.toDomain(entity)),
      total,
    };
  }

  async findById(id: number): Promise<Instructor | null> {
    const entity = await this.repository
      .createQueryBuilder('instructor')
      .innerJoinAndSelect('instructor.user', 'user')
      .where('user.id = :id', { id })
      .getOne();

    if (!entity) return null;

    return InstructorMapper.toDomain(entity);
  }
}
