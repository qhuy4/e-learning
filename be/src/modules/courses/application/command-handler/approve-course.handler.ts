import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApproveCourseCommand } from '../command/approve-course.command';
import { CourseRepository } from '../../infrastructure/repository/course.repository';
import { CourseStatus } from '../../domain/enum/course-status.enum';

@CommandHandler(ApproveCourseCommand)
@Injectable()
export class ApproveCourseHandler
  implements ICommandHandler<ApproveCourseCommand>
{
  constructor(private readonly courseRepository: CourseRepository) {}

  async execute(command: ApproveCourseCommand): Promise<void> {
    const course = await this.courseRepository.findById(command.id);

    if (!course) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    course.status = CourseStatus.PUBLISHED;
    course.publishedAt = new Date();
    course.reviewedAt = new Date();
    course.reviewedBy = command.reviewerId;
    course.rejectReason = null;

    if (course.parentId) {
      const parent = await this.courseRepository.findById(course.parentId);
      if (parent) {
        parent.status = CourseStatus.ARCHIVED;
        await this.courseRepository.update(parent);
      }
    }

    await this.courseRepository.update(course);
  }
}
