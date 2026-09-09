import { Injectable, NotFoundException } from '@nestjs/common';
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
      throw new NotFoundException('Course not found');
    }

    course.status = CourseStatus.REJECTED;
    course.reviewedAt = new Date();
    course.reviewedBy = command.reviewerId;
    course.rejectReason = command.reason || null;

    await this.courseRepository.update(course);
  }
}
