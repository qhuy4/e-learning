import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelReviewCourseCommand } from '../command/cancel-review-course.command';
import { CourseRepository } from '../../infrastructure/repository/course.repository';
import { CourseStatus } from '../../domain/enum/course-status.enum';

@CommandHandler(CancelReviewCourseCommand)
@Injectable()
export class CancelReviewCourseHandler
  implements ICommandHandler<CancelReviewCourseCommand>
{
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(command: CancelReviewCourseCommand): Promise<void> {
    const course = await this.courseRepository.findById(command.id);

    if (!course) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (course.status !== CourseStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        'Chỉ có thể hủy duyệt khi khóa học đang ở trạng thái chờ duyệt',
      );
    }

    course.status = CourseStatus.DRAFT;
    course.rejectReason = null;

    await this.courseRepository.update(course);
  }
}
