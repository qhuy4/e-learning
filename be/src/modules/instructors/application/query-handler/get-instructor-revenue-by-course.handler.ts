import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetInstructorRevenueByCourseQuery } from '@/modules/instructors/application/query/get-instructor-revenue-by-course.query';
import { OrderItemOrmEntity } from '@/modules/orders/infrastructure/entity/order-item.orm-entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';

@QueryHandler(GetInstructorRevenueByCourseQuery)
export class GetInstructorRevenueByCourseHandler
  implements IQueryHandler<GetInstructorRevenueByCourseQuery>
{
  constructor(
    @InjectRepository(OrderItemOrmEntity)
    private readonly orderItemRepo: Repository<OrderItemOrmEntity>,
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepo: Repository<CourseOrmEntity>,
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly profileRepo: Repository<InstructorProfileTypeOrmEntity>,
  ) {}

  async execute(query: GetInstructorRevenueByCourseQuery) {
    const { userId, page, limit } = query;

    const profile = await this.profileRepo.findOne({
      where: { userId },
    });
    const revenueSharePct = profile?.revenueSharePct ?? 70;

    const qb = this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.course', 'c')
      .select('c.id', 'courseId')
      .addSelect('c.title', 'courseTitle')
      .addSelect('c.thumbnail', 'courseThumbnail')
      .addSelect('COUNT(DISTINCT oi.order_id)', 'enrollmentCount')
      .addSelect('SUM(oi.final_price)', 'totalRevenue')
      .where('oi.instructorId = :userId', { userId })
      .groupBy('c.id')
      .addGroupBy('c.title')
      .addGroupBy('c.thumbnail');

    const total = await qb.getCount();
    const data = await qb
      .orderBy('totalRevenue', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();

    return {
      data: data.map((row) => ({
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        courseThumbnail: row.courseThumbnail,
        enrollmentCount: parseInt(row.enrollmentCount, 10),
        totalRevenue: parseFloat(row.totalRevenue ?? '0'),
        instructorShare:
          parseFloat(row.totalRevenue ?? '0') * (revenueSharePct / 100),
        revenueSharePct,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
