import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ReviewOrmEntity } from '@/modules/reviews/domain/entity/review.orm-entity';

export interface FindReviewsOptions {
  page: number;
  limit: number;
  keyword?: string;
  courseId?: number;
  userId?: number;
  status?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly repository: Repository<ReviewOrmEntity>,
  ) {}

  async findAll(options: FindReviewsOptions) {
    const { page, limit, keyword, courseId, userId, status, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.userId', 'user')
      .leftJoinAndSelect('review.courseId', 'course');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('review.comment ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    if (courseId !== undefined) {
      query.andWhere('review.courseId = :courseId', { courseId });
    }

    if (userId !== undefined) {
      query.andWhere('review.userId = :userId', { userId });
    }

    if (status !== undefined) {
      query.andWhere('review.status = :status', { status });
    }

    const sortableColumns: Record<string, string> = {
      rating: 'review.rating',
      createdAt: 'review.created_at',
      status: 'review.status',
    };

    const sortColumn =
      sortBy && sortableColumns[sortBy]
        ? sortableColumns[sortBy]
        : 'review.created_at';

    const sortDirection: 'ASC' | 'DESC' =
      sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortColumn, sortDirection)
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
    return this.repository.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: number) {
    await this.repository.update(id, { status });
    return this.repository.findOne({ where: { id } });
  }
}
