import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorPayoutOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/instructor-payout.orm-entity';
import { RevenueSplitOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/revenue-split.orm-entity';
import { IInstructorPayoutRepository } from '@/modules/instructor-payouts/domain/repository/instructor-payout.repository';
import { InstructorPayoutMapper } from '@/modules/instructor-payouts/infrastructure/mapper/instructor-payout.mapper';

@Injectable()
export class InstructorPayoutRepository implements IInstructorPayoutRepository {
  constructor(
    @InjectRepository(InstructorPayoutOrmEntity)
    private readonly repository: Repository<InstructorPayoutOrmEntity>,
    @InjectRepository(RevenueSplitOrmEntity)
    private readonly revenueSplitRepository: Repository<RevenueSplitOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    instructorId?: number;
    status?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, instructorId, status, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.instructor', 'instructor')
      .leftJoinAndSelect('p.payoutAccount', 'payoutAccount');

    if (instructorId) {
      query.andWhere('p.instructor_id = :instructorId', { instructorId });
    }

    if (status !== undefined) {
      query.andWhere('p.status = :status', { status });
    }

    const sortableColumns: Record<string, string> = {
      totalInstructorAmount: 'p.total_instructor_amount',
      status: 'p.status',
      periodStart: 'p.period_start',
      createdAt: 'p.created_at',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'p.created_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((entity) => InstructorPayoutMapper.toDomain(entity));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: { instructor: true, payoutAccount: true },
    });
    if (!entity) return null;
    return InstructorPayoutMapper.toDomain(entity);
  }

  async create(data: {
    instructorId: number;
    payoutAccountId: number;
    periodStart: string;
    periodEnd: string;
    totalGross: number;
    totalPlatformFee: number;
    totalInstructorAmount: number;
    currency: string;
    status: number;
    paymentMethod: number;
    note?: string;
  }) {
    const entity = this.repository.create({
      instructorId: data.instructorId.toString(),
      payoutAccountId: data.payoutAccountId.toString(),
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      totalGross: data.totalGross.toString(),
      totalPlatformFee: data.totalPlatformFee.toString(),
      totalInstructorAmount: data.totalInstructorAmount.toString(),
      currency: data.currency,
      status: data.status,
      paymentMethod: data.paymentMethod,
      note: data.note ?? null,
    });
    const saved = await this.repository.save(entity);
    return this.findById(Number(saved.id));
  }

  async updateStatus(id: number, data: {
    status: number;
    transactionRef?: string;
    paidAt?: Date;
    note?: string;
  }) {
    await this.repository.update(id.toString(), {
      status: data.status,
      ...(data.transactionRef !== undefined && { transactionRef: data.transactionRef }),
      ...(data.paidAt !== undefined && { paidAt: data.paidAt }),
      ...(data.note !== undefined && { note: data.note }),
    });
    return this.findById(id);
  }

  async findPayoutSplits(payoutId: number) {
    const payout = await this.repository.findOne({
      where: { id: payoutId.toString() },
    });
    if (!payout) return [];

    const entities = await this.revenueSplitRepository
      .createQueryBuilder('rs')
      .leftJoinAndSelect('rs.course', 'course')
      .where('rs.instructor_id = :instructorId', { instructorId: payout.instructorId })
      .andWhere('rs.payout_status = :status', { status: 'included_in_payout' })
      .getMany();

    return entities;
  }
}
