import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UpdateLessonProgressCommand } from '../command/update-lesson-progress.command';
import {
  ILessonProgressRepository,
  LESSON_PROGRESS_REPOSITORY,
} from '../../domain/repository/lesson-progress.repository';
import { LessonProgress } from '../../domain/entity/lesson-progress.entity';
import { Inject, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';
import { LessonAccessService } from '@/modules/lessons/application/service/lesson-access.service';
import { LearningEvent } from '@/modules/achievements/application/event/learning.event';
import { AchievementCriteria } from '@/modules/achievements/domain/enum/achievement-criteria.enum';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

export function calculateCourseProgress(
  progresses: Array<{ watchSeconds: number; isCompleted: boolean }>,
  lessons: Array<{ duration: number | null }>,
) {
  const completedLessons = progresses.filter((item) => item.isCompleted).length;
  const courseCompleted =
    lessons.length > 0 && completedLessons >= lessons.length;
  const totalCourseSeconds = lessons.reduce(
    (sum, lesson) => sum + (lesson.duration || 0),
    0,
  );
  const totalWatchedSeconds = progresses.reduce(
    (sum, progress) => sum + progress.watchSeconds,
    0,
  );
  const progress = courseCompleted
    ? 100
    : totalCourseSeconds > 0
      ? Math.min(
          Math.round((totalWatchedSeconds / totalCourseSeconds) * 100),
          99,
        )
      : Math.min(
          Math.round((completedLessons / Math.max(lessons.length, 1)) * 100),
          99,
        );
  return { progress, courseCompleted };
}

@CommandHandler(UpdateLessonProgressCommand)
export class UpdateLessonProgressHandler implements ICommandHandler<UpdateLessonProgressCommand> {
  private readonly logger = new Logger(UpdateLessonProgressHandler.name);

  constructor(
    @Inject(LESSON_PROGRESS_REPOSITORY)
    private readonly lessonProgressRepository: ILessonProgressRepository,
    @InjectRepository(EnrollmentOrmEntity)
    private readonly enrollmentRepository: Repository<EnrollmentOrmEntity>,
    @InjectRepository(LessonOrmEntity)
    private readonly lessonRepository: Repository<LessonOrmEntity>,
    private readonly lessonAccessService: LessonAccessService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateLessonProgressCommand): Promise<LessonProgress> {
    // Chặn ghi tiến độ bài đang khóa (học tuần tự) — ví dụ gọi API trực tiếp
    // để "tự hoàn thành" bài chưa xem và mở khóa bài sau.
    const lesson = await this.lessonRepository.findOne({
      where: { id: command.lessonId.toString() },
    });
    if (
      lesson &&
      (await this.lessonAccessService.isLocked(lesson, command.userId))
    ) {
      throw new AppException(ErrorCode.LESSON_LOCKED, HttpStatus.FORBIDDEN);
    }

    const existing = await this.lessonProgressRepository.findByUserAndLesson(
      command.userId,
      command.lessonId,
    );

    let result: LessonProgress;

    if (!existing) {
      const progress = new LessonProgress(
        0,
        command.userId,
        command.courseId,
        command.lessonId,
        command.watchSeconds,
        command.progressPercent,
        command.progressPercent >= 90,
        command.progressPercent >= 90 ? new Date() : undefined,
      );

      result = await this.lessonProgressRepository.create(progress);
    } else {
      existing.watchSeconds = Math.max(
        existing.watchSeconds,
        command.watchSeconds,
      );
      existing.progressPercent = Math.max(
        existing.progressPercent,
        command.progressPercent,
      );

      if (command.progressPercent >= 90) {
        existing.isCompleted = true;
        existing.completedAt ??= new Date();
      }

      result = await this.lessonProgressRepository.update(existing);
    }

    this.syncEnrollmentProgress(command.userId, command.courseId).catch((err) =>
      this.logger.error(
        `Failed to sync enrollment progress: ${(err as Error).message}`,
      ),
    );

    if (result.isCompleted) {
      // @nestjs/cqrs v11: publish trả void → không chain .catch trực tiếp.
      void Promise.resolve()
        .then(() => {
          this.eventBus.publish(
            new LearningEvent(
              command.userId,
              AchievementCriteria.LESSONS_COMPLETED,
              {
                courseId: command.courseId,
                lessonId: command.lessonId,
              },
            ),
          );
        })
        .catch((err) =>
          this.logger.error(
            `Failed to publish learning event: ${(err as Error).message}`,
          ),
        );
    }

    return result;
  }

  private async syncEnrollmentProgress(userId: number, courseId: number) {
    const [allProgress, allLessons] = await Promise.all([
      this.lessonProgressRepository.findByUserAndCourse(userId, courseId),
      this.lessonRepository
        .createQueryBuilder('lesson')
        .innerJoin('lesson.section', 'section')
        .where('section.courseId = :courseId', {
          courseId: courseId.toString(),
        })
        .select('lesson.duration', 'duration')
        .getRawMany<{ duration: number | null }>(),
    ]);

    if (allProgress.length === 0) return;

    const { progress, courseCompleted } = calculateCourseProgress(
      allProgress,
      allLessons,
    );

    await this.enrollmentRepository.update(
      { userId: userId.toString(), courseId: courseId.toString() },
      {
        progress,
        ...(courseCompleted ? { completedAt: new Date() } : {}),
      },
    );

    await this.enrollmentRepository.manager.query(
      `UPDATE learning_roadmap_stages s
       SET status = CASE WHEN $3 = 100 THEN 'COMPLETED' ELSE 'IN_PROGRESS' END,
           started_at = COALESCE(s.started_at, CURRENT_TIMESTAMP),
           completed_at = CASE WHEN $3 = 100
             THEN COALESCE(s.completed_at, CURRENT_TIMESTAMP)
             ELSE s.completed_at END,
           updated_at = CURRENT_TIMESTAMP
       FROM learning_roadmaps r
       WHERE s.roadmap_id = r.id AND r.user_id = $1
         AND r.status = 'ACTIVE' AND s.course_id = $2
         AND s.status IN ('PENDING','IN_PROGRESS') AND $3 > 0`,
      [userId, courseId, progress],
    );

    this.logger.debug(
      `Synced enrollment progress: userId=${userId}, courseId=${courseId}, progress=${progress}`,
    );
  }
}
