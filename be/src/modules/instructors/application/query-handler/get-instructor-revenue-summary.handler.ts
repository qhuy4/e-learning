import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetInstructorRevenueSummaryQuery } from '@/modules/instructors/application/query/get-instructor-revenue-summary.query';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { OrderItemOrmEntity } from '@/modules/orders/infrastructure/entity/order-item.orm-entity';

@QueryHandler(GetInstructorRevenueSummaryQuery)
export class GetInstructorRevenueSummaryHandler
  implements IQueryHandler<GetInstructorRevenueSummaryQuery>
{
  constructor(
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly profileRepo: Repository<InstructorProfileTypeOrmEntity>,
    @InjectRepository(OrderItemOrmEntity)
    private readonly orderItemRepo: Repository<OrderItemOrmEntity>,
  ) {}

  async execute(query: GetInstructorRevenueSummaryQuery) {
    const profile = await this.profileRepo.findOne({
      where: { userId: query.userId },
    });

    const revenueResult = await this.orderItemRepo
      .createQueryBuilder('oi')
      .select('COALESCE(SUM(oi.final_price), 0)', 'totalRevenue')
      .where('oi.instructorId = :userId', { userId: query.userId })
      .getRawOne();

    const pendingResult = await this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .select('COALESCE(SUM(oi.final_price), 0)', 'pendingRevenue')
      .where('oi.instructorId = :userId', { userId: query.userId })
      .andWhere('o.status != :status', { status: 'PAID' })
      .getRawOne();

    return {
      totalEarned: profile?.totalEarned ?? 0,
      pendingPayout: pendingResult?.pendingRevenue ?? 0,
      revenueSharePct: profile?.revenueSharePct ?? 70,
      totalStudents: profile?.totalStudents ?? 0,
      avgRating: profile?.avgRating ?? 0,
      totalRevenue: parseFloat(revenueResult?.totalRevenue ?? '0'),
    };
  }
}
