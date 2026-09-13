import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLessonProgressCommand } from '../command/update-lesson-progress.command';
import {
  ILessonProgressRepository,
  LESSON_PROGRESS_REPOSITORY,
} from '../../domain/repository/lesson-progress.repository';
import { LessonProgress } from '../../domain/entity/lesson-progress.entity';
import { Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { LessonOrmEntity } from '@/modules/lessons/infrastructure/entity/lesson.orm-entity';

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
  ) {}

  async execute(command: UpdateLessonProgressCommand): Promise<LessonProgress> {
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
      existing.watchSeconds = Math.max(existing.watchSeconds, command.watchSeconds);
      existing.progressPercent = Math.max(existing.progressPercent, command.progressPercent);

      if (command.progressPercent >= 90) {
        existing.isCompleted = true;
        existing.completedAt ??= new Date();
      }

      result = await this.lessonProgressRepository.update(existing);
    }

    this.syncEnrollmentProgress(command.userId, command.courseId).catch((err) =>
      this.logger.error(`Failed to sync enrollment progress: ${(err as Error).message}`),
    );

    return result;
  }

  private async syncEnrollmentProgress(userId: number, courseId: number) {
    const [allProgress, allLessons] = await Promise.all([
      this.lessonProgressRepository.findByUserAndCourse(userId, courseId),
      this.lessonRepository
        .createQueryBuilder('lesson')
        .innerJoin('lesson.section', 'section')
        .where('section.courseId = :courseId', { courseId: courseId.toString() })
        .select('lesson.duration', 'duration')
        .getRawMany<{ duration: number | null }>(),
    ]);

    if (allProgress.length === 0) return;

    const totalCourseSeconds = allLessons.reduce((sum, l) => sum + (l.duration || 0), 0);
    const totalWatchedSeconds = allProgress.reduce((sum, p) => sum + p.watchSeconds, 0);

    const progress = totalCourseSeconds > 0
      ? Math.min(Math.round((totalWatchedSeconds / totalCourseSeconds) * 100), 100)
      : 0;

    await this.enrollmentRepository.update(
      { userId: userId.toString(), courseId: courseId.toString() },
      { progress },
    );

    this.logger.debug(`Synced enrollment progress: userId=${userId}, courseId=${courseId}, progress=${progress}`);
  }
}
