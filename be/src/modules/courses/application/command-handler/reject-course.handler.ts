import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectCourseCommand } from '../command/reject-course.command';
import { CourseRepository } from '../../infrastructure/repository/course.repository';
import { CourseStatus } from '../../domain/enum/course-status.enum';

@CommandHandler(RejectCourseCommand)
@Injectable()
export class RejectCourseHandler
  implements ICommandHandler<RejectCourseCommand>
{
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(command: RejectCourseCommand): Promise<void> {
    const course = await this.courseRepository.findById(command.id);

    if (!course) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    course.status = CourseStatus.REJECTED;
    course.reviewedAt = new Date();
    course.reviewedBy = command.reviewerId;
    course.rejectReason = command.reason || null;

    await this.courseRepository.update(course);
  }
}
