import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';

export interface FindReviewsOptions {
  page: number;
  limit: number;
  keyword?: string;
  courseId?: string;
  userId?: string;
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
    const { page, limit, courseId, userId, status, sortBy, sortOrder } =
      options;

    const where: FindOptionsWhere<ReviewOrmEntity> = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (status !== undefined) {
      where.status = status;
    }

    const columnMap: Record<
      NonNullable<FindReviewsOptions['sortBy']>,
      keyof ReviewOrmEntity
    > = {
      rating: 'rating',
      createdAt: 'createdAt',
      status: 'status',
    };

    const sortKey = sortBy && columnMap[sortBy] ? columnMap[sortBy] : 'createdAt';
    const order: FindOptionsOrder<ReviewOrmEntity> = {
      [sortKey]: sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    };

    const [data, total] = await this.repository.findAndCount({
      where,
      order,
      relations: { user: true, course: true },
      skip: (page - 1) * limit,
      take: limit,
    });

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

  async findById(id: string) {
    return this.repository.findOne({ where: { id }, relations: { user: true, course: true } });
  }

  async updateStatus(id: string, status: number) {
    await this.repository.update(id, { status });
    return this.repository.findOne({ where: { id }, relations: { user: true, course: true } });
  }
}
