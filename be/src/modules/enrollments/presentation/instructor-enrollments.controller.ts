import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  GetInstructorEnrollmentsQuery,
  InstructorEnrollmentsPage,
} from '@/modules/enrollments/application/query/get-instructor-enrollments.query';
import { EnrollmentRepository } from '@/modules/enrollments/infrastructure/repository/enrollment.repository';
import { LessonProgressRow } from '@/modules/enrollments/domain/repository/enrollment.repository';

/** Section kèm danh sách lesson trong tiến độ học (getProgress). */
interface SectionProgressItem {
  sectionId: number | string;
  sectionTitle: string;
  sectionPosition: number;
  lessons: Array<
    Omit<LessonProgressRow, 'sectionId' | 'sectionTitle' | 'sectionPosition'>
  >;
}

@UseGuards(JwtAuthGuard)
@Controller('instructor/enrollments')
export class InstructorEnrollmentsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  @Get()
  async findAll(
    @CurrentUser('id') instructorId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.queryBus.execute<
      GetInstructorEnrollmentsQuery,
      InstructorEnrollmentsPage
    >(
      new GetInstructorEnrollmentsQuery({
        instructorId,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        keyword,
        status: status !== undefined ? Number(status) : undefined,
        courseId: courseId !== undefined ? Number(courseId) : undefined,
      }),
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUser('id') instructorId: number,
    @Param('id') id: string,
  ) {
    const enrollment = await this.enrollmentRepo.findById(Number(id));
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const course = enrollment.course;
    if (course && Number(course.id)) {
      const isOwner = await this.enrollmentRepo.isCourseOwnedByInstructor(
        Number(course.id),
        instructorId,
      );
      if (!isOwner) throw new ForbiddenException('You do not own this course');
    }

    return {
      id: enrollment.id,
      userId: enrollment.userId,
      userName: enrollment.user?.name ?? '',
      userEmail: enrollment.user?.email ?? '',
      courseId: enrollment.courseId,
      courseTitle: enrollment.course?.title ?? '',
      courseThumbnail: enrollment.course?.thumbnail ?? null,
      progress: enrollment.progress,
      status: enrollment.status,
      pricePaid: enrollment.pricePaid,
      currency: enrollment.currency,
      enrolledAt: enrollment.enrolledAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      completedAt: enrollment.completedAt,
    };
  }

  @Get(':id/progress')
  async getProgress(
    @CurrentUser('id') instructorId: number,
    @Param('id') id: string,
  ) {
    const enrollment = await this.enrollmentRepo.findById(Number(id));
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const course = enrollment.course;
    if (course) {
      const isOwner = await this.enrollmentRepo.isCourseOwnedByInstructor(
        Number(course.id),
        instructorId,
      );
      if (!isOwner) throw new ForbiddenException('You do not own this course');
    }

    const result = await this.enrollmentRepo.query(
      `
      SELECT
        s.id AS "sectionId",
        s.title AS "sectionTitle",
        s.position AS "sectionPosition",
        l.id AS "lessonId",
        l.title AS "lessonTitle",
        l.type AS "lessonType",
        l.duration AS "lessonDuration",
        l.position AS "lessonPosition",
        COALESCE(lp.watch_seconds, 0) AS "watchSeconds",
        COALESCE(lp.progress_percent, 0) AS "progressPercent",
        COALESCE(lp.is_completed, false) AS "isCompleted",
        lp.completed_at AS "completedAt"
      FROM sections s
      INNER JOIN lessons l ON l.section_id = s.id
      LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = $1
      WHERE s.course_id = $2
      ORDER BY s.position, l.position
    `,
      [enrollment.userId, enrollment.courseId],
    );

    const sections = new Map<number | string, SectionProgressItem>();
    for (const row of result) {
      if (!sections.has(row.sectionId)) {
        sections.set(row.sectionId, {
          sectionId: row.sectionId,
          sectionTitle: row.sectionTitle,
          sectionPosition: row.sectionPosition,
          lessons: [],
        });
      }
      sections.get(row.sectionId)!.lessons.push({
        lessonId: row.lessonId,
        lessonTitle: row.lessonTitle,
        lessonType: row.lessonType,
        lessonDuration: row.lessonDuration,
        lessonPosition: row.lessonPosition,
        watchSeconds: row.watchSeconds,
        progressPercent: row.progressPercent,
        isCompleted: row.isCompleted,
        completedAt: row.completedAt,
      });
    }

    const sectionsArray = Array.from(sections.values());
    const totalLessons = result.length;
    const completedLessons = result.filter((r) => r.isCompleted).length;
    const totalWatchSeconds = result.reduce(
      (sum, r) => sum + r.watchSeconds,
      0,
    );

    return {
      sections: sectionsArray,
      summary: {
        totalLessons,
        completedLessons,
        completionPercent:
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
        totalWatchSeconds,
        totalWatchHours: Math.round((totalWatchSeconds / 3600) * 10) / 10,
      },
    };
  }
}
