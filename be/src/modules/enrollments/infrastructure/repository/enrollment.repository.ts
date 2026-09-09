import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { IEnrollmentRepository } from '@/modules/enrollments/domain/repository/enrollment.repository';
import { EnrollmentMapper } from '@/modules/enrollments/infrastructure/mapper/enrollment.mapper';

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(
    @InjectRepository(EnrollmentOrmEntity)
    private readonly repository: Repository<EnrollmentOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    status?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, keyword, status, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .leftJoinAndSelect('enrollment.course', 'course');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('user.email ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('course.title ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (status !== undefined) {
      query.andWhere('enrollment.status = :status', { status });
    }

    const sortableColumns: Record<string, string> = {
      progress: 'enrollment.progress',
      status: 'enrollment.status',
      enrolledAt: 'enrollment.enrolled_at',
      createdAt: 'enrollment.created_at',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'enrollment.created_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((entity) => EnrollmentMapper.toDomain(entity));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: { user: true, course: true },
    });

    if (!entity) return null;

    return EnrollmentMapper.toDomain(entity);
  }
}
