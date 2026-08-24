import { Inject, NotFoundException } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import slugify from 'slugify';

import { UpdateCourseCommand } from '../command/update-course.command';

import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '../../domain/repository/course.repository';

@CommandHandler(UpdateCourseCommand)
export class UpdateCourseHandler implements ICommandHandler<UpdateCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: UpdateCourseCommand) {
    const course = await this.courseRepository.findById(command.id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const slug = command.data.title
      ? slugify(command.data.title, {
          lower: true,
          strict: true,
          trim: true,
        })
      : undefined;

    course.update({
      ...command.data,
      slug,
    });

    return this.courseRepository.update(course);
  }
}
