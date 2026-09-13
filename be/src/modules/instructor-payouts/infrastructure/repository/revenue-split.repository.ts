import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { RevenueSplitOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/revenue-split.orm-entity';
import { IRevenueSplitRepository } from '@/modules/instructor-payouts/domain/repository/revenue-split.repository';
import { RevenueSplitMapper } from '@/modules/instructor-payouts/infrastructure/mapper/revenue-split.mapper';

@Injectable()
export class RevenueSplitRepository implements IRevenueSplitRepository {
  constructor(
    @InjectRepository(RevenueSplitOrmEntity)
    private readonly repository: Repository<RevenueSplitOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    instructorId?: number;
    courseId?: number;
    payoutStatus?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, instructorId, courseId, payoutStatus, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('rs')
      .leftJoinAndSelect('rs.course', 'course')
      .leftJoinAndSelect('rs.instructor', 'instructor');

    if (instructorId) {
      query.andWhere('rs.instructor_id = :instructorId', { instructorId });
    }

    if (courseId) {
      query.andWhere('rs.course_id = :courseId', { courseId });
    }

    if (payoutStatus) {
      query.andWhere('rs.payout_status = :payoutStatus', { payoutStatus });
    }

    const sortableColumns: Record<string, string> = {
      grossAmount: 'rs.gross_amount',
      instructorAmount: 'rs.instructor_amount',
      payoutStatus: 'rs.payout_status',
      createdAt: 'rs.created_at',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'rs.created_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((entity) => RevenueSplitMapper.toDomain(entity));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSummary(options: { instructorId?: number; payoutStatus?: string }) {
    const query = this.repository.createQueryBuilder('rs');

    if (options.instructorId) {
      query.andWhere('rs.instructor_id = :instructorId', { instructorId: options.instructorId });
    }

    const result = await query
      .select([
        'COALESCE(SUM(rs.gross_amount), 0)::numeric(14,2) AS "totalGross"',
        'COALESCE(SUM(rs.platform_fee_amount), 0)::numeric(14,2) AS "totalPlatformFee"',
        'COALESCE(SUM(rs.instructor_amount), 0)::numeric(14,2) AS "totalInstructorAmount"',
        'COUNT(*)::int AS "totalSplits"',
      ])
      .getRawOne();

    const pendingCount = await query
      .clone()
      .andWhere('rs.payout_status = :status', { status: 'pending' })
      .getCount();

    const paidCount = await query
      .clone()
      .andWhere('rs.payout_status = :status', { status: 'paid' })
      .getCount();

    return {
      totalGross: Number(result?.totalGross ?? 0),
      totalPlatformFee: Number(result?.totalPlatformFee ?? 0),
      totalInstructorAmount: Number(result?.totalInstructorAmount ?? 0),
      totalSplits: Number(result?.totalSplits ?? 0),
      pendingCount,
      paidCount,
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: { course: true, instructor: true },
    });
    if (!entity) return null;
    return RevenueSplitMapper.toDomain(entity);
  }
}
