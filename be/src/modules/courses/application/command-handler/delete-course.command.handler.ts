import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { DeleteCourseCommand } from '@/modules/courses/application/command/delete-course.command';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';

@CommandHandler(DeleteCourseCommand)
export class DeleteCourseHandler implements ICommandHandler<DeleteCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: DeleteCourseCommand) {
    const course = await this.courseRepository.findById(command.id);

    if (!course) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.courseRepository.delete(command.id);
  }
}
