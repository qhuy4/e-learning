import { Inject, NotFoundException } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteLessonCommand } from '@/modules/lessons/application/command/delete-lesson.command';

import {
  LESSON_REPOSITORY,
  ILessonRepository,
} from '@/modules/lessons/domain/repository/lesson.repository';

@CommandHandler(DeleteLessonCommand)
export class DeleteLessonHandler implements ICommandHandler<DeleteLessonCommand> {
  constructor(
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(command: DeleteLessonCommand) {
    const lesson = await this.lessonRepository.findById(command.id);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await this.lessonRepository.delete(command.id);

    return {
      success: true,
    };
  }
}
