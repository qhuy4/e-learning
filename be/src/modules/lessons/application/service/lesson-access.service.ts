import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from '@/modules/enrollments/domain/repository/enrollment.repository';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { SectionOrmEntity } from '@/modules/sections/infrastructure/entity/section.orm-entity';
import { LessonProgressOrmEntity } from '@/modules/lesson-progress/infrastructure/entity/lesson-progress.orm-entity';

/** Xem >= 90% bài đứng trước (cùng ngưỡng với lesson-progress) thì mở khóa bài tiếp theo. */
export const LESSON_UNLOCK_PERCENT = 90;

/**
 * Quy tắc mở khóa bài học theo thứ tự (học tuần tự):
 * - Bài đầu tiên của khóa luôn mở.
 * - Bài tiếp theo chỉ mở khi bài đứng trước đã hoàn thành (xem >= 90%).
 *
 * Chỉ áp dụng cho học viên đã ghi danh — khách xem thử và bài xem thử (isPreview)
 * không bị khóa; quyền "chưa mua khóa" do tầng ghi danh xử lý riêng.
 */
@Injectable()
export class LessonAccessService {
  private readonly logger = new Logger(LessonAccessService.name);

  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @InjectRepository(SectionOrmEntity)
    private readonly sectionRepository: Repository<SectionOrmEntity>,
    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepository: Repository<LessonOrmEntity>,
    @InjectRepository(LessonProgressOrmEntity)
    private readonly progressRepository: Repository<LessonProgressOrmEntity>,
  ) {}

  async isLocked(
    lesson: { id: number | string | null; sectionId: number | string | null; isPreview?: boolean },
    userId?: number,
  ): Promise<boolean> {
    // Khách vãng lai / bài xem thử / bài không thuộc chương nào → không áp khóa tuần tự.
    if (!userId || lesson.isPreview || !lesson.sectionId || lesson.id == null) return false;

    const section = await this.sectionRepository.findOne({
      where: { id: lesson.sectionId.toString() },
    });
    if (!section) return false;

    const courseId = Number(section.courseId);
    const isEnrolled = await this.enrollmentRepository.existsActiveByUserAndCourse(
      userId,
      courseId,
    );
    // Chưa mua khóa → "chưa ghi danh" chặn ở tầng quyền xem video, không phải khóa tuần tự.
    if (!isEnrolled) return false;

    const orderedLessonIds = await this.getOrderedLessonIds(courseId);
    const index = orderedLessonIds.indexOf(Number(lesson.id));
    if (index <= 0) return false; // Bài đầu tiên luôn mở.

    const previousLessonId = orderedLessonIds[index - 1];
    const previousProgress = await this.progressRepository.findOne({
      where: { userId, lessonId: previousLessonId },
    });

    const previousCompleted =
      previousProgress !== null &&
      (previousProgress.isCompleted ||
        previousProgress.progressPercent >= LESSON_UNLOCK_PERCENT);

    if (!previousCompleted) {
      this.logger.debug(
        `Lesson ${lesson.id} locked for userId=${userId}: previous lesson ${previousLessonId} chưa hoàn thành`,
      );
    }

    return !previousCompleted;
  }

  /** Thứ tự bài học như học viên đang thấy: section.position → lesson.position. */
  private async getOrderedLessonIds(courseId: number): Promise<number[]> {
    const rows = await this.lessonRepository
      .createQueryBuilder('lesson')
      .innerJoin('lesson.section', 'section')
      .select('lesson.id', 'id')
      .where('section.courseId = :courseId', { courseId: courseId.toString() })
      .andWhere('section.deletedAt IS NULL')
      .andWhere('section.isActive = true')
      .andWhere('lesson.deletedAt IS NULL')
      .orderBy('section.position', 'ASC')
      .addOrderBy('lesson.position', 'ASC')
      .getRawMany<{ id: string }>();

    return rows.map((row) => Number(row.id));
  }
}
