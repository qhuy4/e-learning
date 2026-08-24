import { Inject, NotFoundException } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import slugify from 'slugify';

import { UpdateLessonCommand } from '../command/update-lesson.command';

import {
  LESSON_REPOSITORY,
  ILessonRepository,
} from '../../domain/repository/lesson.repository';

@CommandHandler(UpdateLessonCommand)
export class UpdateLessonHandler implements ICommandHandler<UpdateLessonCommand> {
  constructor(
    @Inject(LESSON_REPOSITORY)
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(command: UpdateLessonCommand) {
    const lesson = await this.lessonRepository.findById(command.id);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const slug = command.data.title
      ? slugify(command.data.title, {
          lower: true,
          strict: true,
          trim: true,
        })
      : undefined;

    lesson.update({
      ...command.data,
      slug,
    });

    return this.lessonRepository.update(lesson);
  }
}
