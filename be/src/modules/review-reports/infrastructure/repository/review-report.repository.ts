import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ReviewReportOrmEntity } from '@/modules/review-reports/infrastructure/entity/review-report.orm-entity';
import { IReviewReportRepository } from '@/modules/review-reports/domain/repository/review-report.repository';
import { ReviewReportMapper } from '@/modules/review-reports/infrastructure/mapper/review-report.mapper';

@Injectable()
export class ReviewReportRepository implements IReviewReportRepository {
  constructor(
    @InjectRepository(ReviewReportOrmEntity)
    private readonly repository: Repository<ReviewReportOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    status?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, status, keyword, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('rr')
      .leftJoinAndSelect('rr.review', 'review')
      .leftJoinAndSelect('rr.reporter', 'reporter')
      .leftJoinAndSelect('review.user', 'reviewUser')
      .leftJoinAndSelect('review.course', 'course');

    if (status !== undefined) {
      query.andWhere('rr.status = :status', { status });
    }

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('rr.reason ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('reporter.name ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('reviewUser.name ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    const sortableColumns: Record<string, string> = {
      createdAt: 'rr.created_at',
      status: 'rr.status',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'rr.created_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((entity) => ReviewReportMapper.toDomain(entity));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: {
        review: { user: true, course: true },
        reporter: true,
        resolver: true,
      },
    });
    if (!entity) return null;
    return ReviewReportMapper.toDomain(entity);
  }

  async resolve(id: number, resolvedBy: number) {
    await this.repository.update(id.toString(), {
      status: 1,
      resolvedBy: resolvedBy.toString(),
      resolvedAt: new Date(),
    });
    return this.findById(id);
  }

  async dismiss(id: number) {
    await this.repository.update(id.toString(), {
      status: 2,
    });
    return this.findById(id);
  }

  async delete(id: number) {
    await this.repository.delete(id.toString());
  }
}
