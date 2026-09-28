import { Injectable, ForbiddenException, HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';

import { GetCourseAnalyticsQuery } from '@/modules/analytics/application/query/get-course-analytics.query';
import { CourseViewOrmEntity } from '@/modules/analytics/infrastructure/entity/course-view.orm-entity';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { LessonProgressOrmEntity } from '@/modules/lesson-progress/infrastructure/entity/lesson-progress.orm-entity';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';
import { OrderItemOrmEntity } from '@/modules/orders/infrastructure/entity/order-item.orm-entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';

function getDateRangeStart(range: string): Date {
  const now = new Date();
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0);
  }
}

@QueryHandler(GetCourseAnalyticsQuery)
@Injectable()
export class GetCourseAnalyticsHandler
  implements IQueryHandler<GetCourseAnalyticsQuery>
{
  constructor(
    @InjectRepository(CourseViewOrmEntity)
    private readonly courseViewRepo: Repository<CourseViewOrmEntity>,
    @InjectRepository(EnrollmentOrmEntity)
    private readonly enrollmentRepo: Repository<EnrollmentOrmEntity>,
    @InjectRepository(LessonProgressOrmEntity)
    private readonly lessonProgressRepo: Repository<LessonProgressOrmEntity>,
    @InjectRepository(ReviewOrmEntity)
    private readonly reviewRepo: Repository<ReviewOrmEntity>,
    @InjectRepository(OrderItemOrmEntity)
    private readonly orderItemRepo: Repository<OrderItemOrmEntity>,
    @InjectRepository(CourseOrmEntity)
    private readonly courseRepo: Repository<CourseOrmEntity>,
    @InjectRepository(SectionOrmEntity)
    private readonly sectionRepo: Repository<SectionOrmEntity>,
    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepo: Repository<LessonOrmEntity>,
  ) {}

  async execute(query: GetCourseAnalyticsQuery) {
    const { instructorId, courseId, dateRange, startDate: customStartDate, endDate: customEndDate } = query;

    const course = await this.courseRepo.findOne({ where: { id: String(courseId) } });
    if (!course) throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    if (Number(course.instructorId) !== instructorId)
      throw new ForbiddenException('Access denied');

    const startDate = customStartDate ? new Date(customStartDate) : getDateRangeStart(dateRange);

    // ── Overview ──────────────────────────────────────────────────────────
    const totalStudents = await this.enrollmentRepo.count({
      where: { courseId: String(courseId), status: In([1, 2]) },
    });

    const totalViews = await this.courseViewRepo.count({
      where:
        dateRange === 'all'
          ? { courseId }
          : { courseId, viewedAt: MoreThanOrEqual(startDate) },
    } as any);

    const completedStudents = await this.enrollmentRepo.count({
      where: { courseId: String(courseId), status: 2 },
    });

    const completionRate =
      totalStudents > 0
        ? Math.round((completedStudents / totalStudents) * 1000) / 10
        : 0;

    // ── Rating ────────────────────────────────────────────────────────────
    const ratingRows = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avgRating')
      .addSelect('COUNT(*)', 'totalReviews')
      .where('r.course_id = :courseId', { courseId: String(courseId) })
      .andWhere('r.deleted_at IS NULL')
      .getRawOne();

    const avgRating = ratingRows?.avgRating
      ? Math.round(Number(ratingRows.avgRating) * 10) / 10
      : 0;
    const totalReviews = Number(ratingRows?.totalReviews ?? 0);

    const ratingDistribution = await this.reviewRepo
      .createQueryBuilder('r')
      .select('r.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('r.course_id = :courseId', { courseId: String(courseId) })
      .andWhere('r.deleted_at IS NULL')
      .groupBy('r.rating')
      .orderBy('r.rating', 'DESC')
      .getRawMany();

    // ── Enrollment Trend ──────────────────────────────────────────────────
    const enrollmentTrend = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select("TO_CHAR(e.enrolled_at, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('e.course_id = :courseId', { courseId: String(courseId) })
      .andWhere(
        dateRange === 'all'
          ? '1=1'
          : 'e.enrolled_at >= :startDate',
        { startDate },
      )
      .andWhere('e.enrolled_at IS NOT NULL')
      .groupBy("TO_CHAR(e.enrolled_at, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(e.enrolled_at, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    // ── Views Trend ───────────────────────────────────────────────────────
    const viewsTrend = await this.courseViewRepo
      .createQueryBuilder('v')
      .select("TO_CHAR(v.viewed_at, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('v.course_id = :courseId', { courseId })
      .andWhere(
        dateRange === 'all'
          ? '1=1'
          : 'v.viewed_at >= :startDate',
        { startDate },
      )
      .groupBy("TO_CHAR(v.viewed_at, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(v.viewed_at, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    // ── Enrollment Growth ─────────────────────────────────────────────────
    const periodMs =
      dateRange === '7d'
        ? 7 * 86400000
        : dateRange === '90d'
          ? 90 * 86400000
          : dateRange === '1y'
            ? 365 * 86400000
            : 30 * 86400000;
    const prevStart = new Date(startDate.getTime() - periodMs);

    const currentPeriodEnrollments = await this.enrollmentRepo.count({
      where: {
        courseId: String(courseId),
        enrolledAt: MoreThanOrEqual(startDate),
      },
    });
    const prevPeriodEnrollments = await this.enrollmentRepo.count({
      where: {
        courseId: String(courseId),
        enrolledAt: MoreThanOrEqual(prevStart),
        // We need enrolledAt < startDate, but TypeORM doesn't support range in where easily
        // We'll filter in memory
      },
    });
    // Actually count prev period properly
    const prevPeriodCount = await this.enrollmentRepo
      .createQueryBuilder('e')
      .where('e.course_id = :courseId', { courseId: String(courseId) })
      .andWhere('e.enrolled_at >= :prevStart', { prevStart })
      .andWhere('e.enrolled_at < :startDate', { startDate })
      .getCount();

    // ── Average Progress ──────────────────────────────────────────────────
    const avgProgressResult = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('AVG(e.progress)', 'avgProgress')
      .where('e.course_id = :courseId', { courseId: String(courseId) })
      .andWhere('e.status IN (:...statuses)', { statuses: [1, 2] })
      .getRawOne();

    const avgProgress = avgProgressResult?.avgProgress
      ? Math.round(Number(avgProgressResult.avgProgress) * 10) / 10
      : 0;

    // ── Learning Time ─────────────────────────────────────────────────────
    const learningTimeResult = await this.lessonProgressRepo
      .createQueryBuilder('lp')
      .select('AVG(lp.watch_seconds)', 'avgWatchSeconds')
      .addSelect('SUM(lp.watch_seconds)', 'totalWatchSeconds')
      .where('lp.course_id = :courseId', { courseId })
      .getRawOne();

    const avgWatchSeconds = Number(learningTimeResult?.avgWatchSeconds ?? 0);
    const totalWatchSeconds = Number(learningTimeResult?.totalWatchSeconds ?? 0);

    // ── Active Students (had lesson progress in period) ───────────────────
    const activeStudents = await this.lessonProgressRepo
      .createQueryBuilder('lp')
      .select('COUNT(DISTINCT lp.user_id)', 'count')
      .where('lp.course_id = :courseId', { courseId })
      .andWhere(
        dateRange === 'all'
          ? '1=1'
          : 'lp.updated_at >= :startDate',
        { startDate },
      )
      .getRawOne();

    // ── Lesson Performance ────────────────────────────────────────────────
    const sections = await this.sectionRepo.find({
      where: { courseId: String(courseId), isActive: true },
      order: { position: 'ASC' },
    });

    const sectionIds = sections.map((s) => s.id);
    const lessons = sectionIds.length
      ? await this.lessonRepo.find({
          where: { sectionId: In(sectionIds) },
          order: { position: 'ASC' },
        })
      : [];

    const lessonIds = lessons.map((l) => l.id);

    const lessonProgressStats = lessonIds.length
      ? await this.lessonProgressRepo
          .createQueryBuilder('lp')
          .select('lp.lesson_id', 'lessonId')
          .addSelect('COUNT(*)', 'totalStarted')
          .addSelect(
            'SUM(CASE WHEN lp.is_completed = true THEN 1 ELSE 0 END)',
            'completed',
          )
          .addSelect('AVG(lp.watch_seconds)', 'avgWatchTime')
          .where('lp.lesson_id IN (:...lessonIds)', { lessonIds })
          .groupBy('lp.lesson_id')
          .getRawMany()
      : [];

    const lessonProgressMap = new Map(
      lessonProgressStats.map((row: any) => [Number(row.lessonId), row]),
    );

    const lessonPerformance = lessons.map((lesson) => {
      const stat = lessonProgressMap.get(Number(lesson.id));
      const started = Number(stat?.totalStarted ?? 0);
      const completed = Number(stat?.completed ?? 0);
      const avgWatchTime = Number(stat?.avgWatchTime ?? 0);
      const completionRate =
        started > 0 ? Math.round((completed / started) * 1000) / 10 : null;
      const dropOffRate =
        started > 0
          ? Math.round(((started - completed) / started) * 1000) / 10
          : null;

      return {
        lessonId: lesson.id,
        title: lesson.title,
        type: lesson.type,
        position: lesson.position,
        sectionId: lesson.sectionId,
        totalStarted: started,
        completed,
        completionRate,
        avgWatchTime: Math.round(avgWatchTime),
        dropOffRate,
      };
    });

    // ── Sections with lessons ─────────────────────────────────────────────
    const sectionsData = sections.map((section) => ({
      id: section.id,
      title: section.title,
      position: section.position,
      lessons: lessonPerformance.filter(
        (lp) => lp.sectionId === section.id,
      ),
    }));

    // ── Revenue ───────────────────────────────────────────────────────────
    const revenueResult = await this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .select('SUM(oi.final_price)', 'totalRevenue')
      .addSelect(
        `SUM(CASE WHEN o.created_at >= :startDate THEN oi.final_price ELSE 0 END)`,
        'periodRevenue',
      )
      .where('oi.course_id = :courseId', { courseId: String(courseId) })
      .andWhere("o.status = '1'")
      .andWhere('o.created_at IS NOT NULL')
      .setParameters({ startDate })
      .getRawOne();

    const totalRevenue = Number(revenueResult?.totalRevenue ?? 0);
    const periodRevenue = Number(revenueResult?.periodRevenue ?? 0);

    // ── Revenue Trend ─────────────────────────────────────────────────────
    const revenueTrend = await this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .select("TO_CHAR(o.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(oi.final_price)', 'revenue')
      .where('oi.course_id = :courseId', { courseId: String(courseId) })
      .andWhere("o.status = '1'")
      .andWhere('o.created_at IS NOT NULL')
      .andWhere(
        dateRange === 'all'
          ? '1=1'
          : 'o.created_at >= :startDate',
        { startDate },
      )
      .groupBy("TO_CHAR(o.created_at, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(o.created_at, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return {
      overview: {
        totalStudents,
        totalViews,
        completionRate,
        avgRating,
        totalRevenue,
      },
      enrollmentTrend: enrollmentTrend.map((row: any) => ({
        date: row.date,
        count: Number(row.count),
      })),
      viewsTrend: viewsTrend.map((row: any) => ({
        date: row.date,
        count: Number(row.count),
      })),
      enrollmentGrowth: {
        currentPeriod: currentPeriodEnrollments,
        previousPeriod: prevPeriodCount,
        growthRate:
          prevPeriodCount > 0
            ? Math.round(
                ((currentPeriodEnrollments - prevPeriodCount) /
                  prevPeriodCount) *
                  1000,
              ) / 10
            : null,
      },
      engagement: {
        activeStudents: Number(activeStudents?.count ?? 0),
        completedStudents,
        avgProgress,
        avgLearningTime: Math.round(avgWatchSeconds),
        totalLearningTime: Math.round(totalWatchSeconds),
      },
      sections: sectionsData,
      rating: {
        avgRating,
        totalReviews,
        distribution: ratingDistribution.map((row: any) => ({
          rating: Number(row.rating),
          count: Number(row.count),
        })),
      },
      revenue: {
        totalRevenue,
        periodRevenue,
        trend: revenueTrend.map((row: any) => ({
          date: row.date,
          revenue: Number(row.revenue),
        })),
      },
    };
  }
}
