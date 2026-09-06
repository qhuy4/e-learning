import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLessonProgressCommand } from '../command/update-lesson-progress.command';
import {
  ILessonProgressRepository,
  LESSON_PROGRESS_REPOSITORY,
} from '../../domain/repository/lesson-progress.repository';
import { LessonProgress } from '../../domain/entity/lesson-progress.entity';
import { Inject } from '@nestjs/common';

@CommandHandler(UpdateLessonProgressCommand)
export class UpdateLessonProgressHandler implements ICommandHandler<UpdateLessonProgressCommand> {
  constructor(
    @Inject(LESSON_PROGRESS_REPOSITORY)
    private readonly lessonProgressRepository: ILessonProgressRepository,
  ) {}

  async execute(command: UpdateLessonProgressCommand): Promise<LessonProgress> {
    const existing = await this.lessonProgressRepository.findByUserAndLesson(
      command.userId,
      command.lessonId,
    );

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

      return this.lessonProgressRepository.create(progress);
    }

    existing.watchSeconds = command.watchSeconds;
    existing.progressPercent = command.progressPercent;

    if (command.progressPercent >= 90) {
      existing.isCompleted = true;
      existing.completedAt ??= new Date();
    }

    return this.lessonProgressRepository.update(existing);
  }
}
