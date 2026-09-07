import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ReviewCourseCommand } from '@/modules/courses/application/command/review-course.command';
import { AdminCourseRepository } from '@/modules/courses/infrastructure/repository/admin-course.repository';

@CommandHandler(ReviewCourseCommand)
export class ReviewCourseHandler implements ICommandHandler<ReviewCourseCommand> {
  constructor(private readonly adminCourseRepository: AdminCourseRepository) {}

  async execute(command: ReviewCourseCommand) {
    const { id, status, rejectReason } = command.data;
    const course = await this.adminCourseRepository.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return this.adminCourseRepository.review(id, status, rejectReason);
  }
}
