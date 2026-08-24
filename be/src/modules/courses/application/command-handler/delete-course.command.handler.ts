import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteCourseCommand } from '../command/delete-course.command';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '../../domain/repository/course.repository';

@CommandHandler(DeleteCourseCommand)
export class DeleteCourseHandler implements ICommandHandler<DeleteCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: DeleteCourseCommand) {
    const course = await this.courseRepository.findById(command.id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.courseRepository.delete(command.id);
  }
}
