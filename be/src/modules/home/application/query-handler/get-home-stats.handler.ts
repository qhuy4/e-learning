import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { GetHomeStatsQuery } from '@/modules/home/application/query/get-home-stats.query';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';
import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';
import { UserRole } from '@/modules/users/domain/enum/user.role';

@QueryHandler(GetHomeStatsQuery)
export class GetHomeStatsHandler implements IQueryHandler<GetHomeStatsQuery> {
  constructor(
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepo: Repository<CourseOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(EnrollmentOrmEntity)
    private readonly enrollmentRepo: Repository<EnrollmentOrmEntity>,
    @InjectRepository(ReviewOrmEntity)
    private readonly reviewRepo: Repository<ReviewOrmEntity>,
  ) {}

  async execute() {
    const totalCourses = await this.courseRepo.count({
      where: { status: CourseStatus.PUBLISHED, deletedAt: IsNull() },
    });

    const totalStudents = await this.userRepo.count({
      where: { role: UserRole.STUDENT },
    });

    const totalInstructors = await this.userRepo.count({
      where: { role: UserRole.INSTRUCTOR },
    });

    const avgResult = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.status = :status', { status: 1 })
      .getRawOne();

    return {
      totalCourses,
      totalStudents,
      totalInstructors,
      avgRating: avgResult?.avg ? Number(Number(avgResult.avg).toFixed(1)) : 0,
    };
  }
}
