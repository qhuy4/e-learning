import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';

export interface FindAdminCoursesOptions {
  page: number;
  limit: number;
  keyword?: string;
  status?: number;
  instructorId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class AdminCourseRepository {
  constructor(
    @InjectRepository(CourseOrmEntity)
    private readonly repository: Repository<CourseOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async findAll(options: FindAdminCoursesOptions) {
    const { page, limit, keyword, status, instructorId, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('course.title ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('course.description ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    if (status !== undefined) {
      query.andWhere('course.status = :status', { status });
    } else {
      query.andWhere('course.status != :draftStatus', { draftStatus: 0 });
      query.andWhere('course.status != :draftStatus1', { draftStatus1: 1 });
    }

    if (instructorId) {
      query.andWhere('course.instructorId = :instructorId', { instructorId });
    }

    const sortableColumns: Record<string, string> = {
      title: 'course.title',
      status: 'course.status',
      createdAt: 'course.created_at',
      updatedAt: 'course.updated_at',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'course.created_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.repository.findOne({
      where: { id },
      relations: { sections: { lessons: true } },
    });
  }

  async review(id: string, status: number, rejectReason?: string) {
    await this.repository.update(id, {
      status,
      rejectReason: rejectReason ?? null,
      reviewedAt: new Date(),
    });
    return this.repository.findOne({
      where: { id },
      relations: { sections: { lessons: true } },
    });
  }
}
