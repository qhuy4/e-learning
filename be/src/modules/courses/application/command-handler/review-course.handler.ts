import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { ReviewCourseCommand } from '@/modules/courses/application/command/review-course.command';
import { AdminCourseRepository } from '@/modules/courses/infrastructure/repository/admin-course.repository';

@CommandHandler(ReviewCourseCommand)
export class ReviewCourseHandler implements ICommandHandler<ReviewCourseCommand> {
  constructor(private readonly adminCourseRepository: AdminCourseRepository) {}

  async execute(command: ReviewCourseCommand) {
    const { id, status, rejectReason } = command.data;
    const course = await this.adminCourseRepository.findById(id);
    if (!course) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return this.adminCourseRepository.review(id, status, rejectReason);
  }
}
