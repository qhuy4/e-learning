import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { IEnrollmentRepository } from '@/modules/enrollments/domain/repository/enrollment.repository';
import { EnrollmentMapper } from '@/modules/enrollments/infrastructure/mapper/enrollment.mapper';
import { Enrollment } from '@/modules/enrollments/domain/entity/enrollment.entity';

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

  async findByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | null> {
    const entity = await this.repository.findOne({
      where: {
        userId: userId.toString(),
        courseId: courseId.toString(),
      },
      relations: { user: true, course: true },
    });

    if (!entity) return null;

    return EnrollmentMapper.toDomain(entity);
  }

  async findByUser(
    userId: number,
    options?: {
      page?: number;
      limit?: number;
      keyword?: string;
      status?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const { keyword, status, sortBy, sortOrder } = options || {};

    const query = this.repository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('course.instructorUser', 'instructorUser')
      .where('enrollment.userId = :userId', { userId: userId.toString() });

    if (keyword) {
      query.andWhere('course.title ILIKE :keyword', { keyword: `%${keyword}%` });
  async findAllByInstructorId(options: {
    instructorId: number;
    page: number;
    limit: number;
    keyword?: string;
    status?: number;
    courseId?: number;
  }) {
    const { instructorId, page, limit, keyword, status, courseId } = options;

    const query = this.repository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .leftJoinAndSelect('enrollment.course', 'course')
      .where('course.instructorId = :instructorId', { instructorId });

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('user.email ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (status !== undefined) {
      query.andWhere('enrollment.status = :status', { status });
    }

    const sortableColumns: Record<string, string> = {
      progress: 'enrollment.progress',
      enrolledAt: 'enrollment.enrolled_at',
      title: 'course.title',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'enrollment.enrolled_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
    if (courseId !== undefined) {
      query.andWhere('course.id = :courseId', { courseId });
    }

    query
      .orderBy('enrollment.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => EnrollmentMapper.toDomain(entity)),
      total,
    };
  }

  async create(enrollment: Enrollment): Promise<Enrollment> {
    const entity = this.repository.create({
      userId: String(enrollment.userId),
      courseId: String(enrollment.courseId),
      status: enrollment.status,
      progress: enrollment.progress,
      pricePaid: enrollment.pricePaid ? String(enrollment.pricePaid) : null,
      currency: enrollment.currency,
      enrolledAt: enrollment.enrolledAt,
    });

    const saved = await this.repository.save(entity);
    const result = Array.isArray(saved) ? saved[0] : saved;
    return EnrollmentMapper.toDomain(result);
  }

  async existsActiveByUserAndCourse(userId: number, courseId: number): Promise<boolean> {
    const userIdStr = userId.toString();
    const courseIdStr = courseId.toString();

    const allForUser = await this.repository.find({
      where: { userId: userIdStr },
    });
    console.log(`[ENROLLMENT DIAG] all enrollments for userId=${userId}: ${JSON.stringify(allForUser.map(e => ({ id: e.id, courseId: e.courseId, status: e.status, deletedAt: e.deletedAt })))}`);

    const count = await this.repository.count({
      where: {
        userId: userIdStr,
        courseId: courseIdStr,
        status: 1,
      },
    });

    console.log(`[ENROLLMENT DIAG] count for courseId=${courseId}(status=1)=${count}`);
    return count > 0;
  }

  async existsActiveByUserAndCourseSlug(userId: number, courseSlug: string): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.course', 'course')
      .where('enrollment.userId = :userId', { userId: userId.toString() })
      .andWhere('enrollment.status = :status', { status: 1 })
      .andWhere('course.slug = :courseSlug', { courseSlug })
      .getCount();

    return count > 0;
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
}
