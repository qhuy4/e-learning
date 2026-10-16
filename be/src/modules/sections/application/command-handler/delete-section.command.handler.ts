import { Inject, HttpStatus } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteSectionCommand } from '@/modules/sections/application/command/delete-section.command';

import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '@/modules/sections/domain/repository/section.repository';

import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

// DRAFT(1), APPROVED(3), REJECTED(4), PUBLISHED(5) — chặn PENDING_REVIEW(2) & ARCHIVED(6)
const EDITABLE_STATUSES = [1, 3, 4, 5];

@CommandHandler(DeleteSectionCommand)
export class DeleteSectionHandler implements ICommandHandler<DeleteSectionCommand> {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: DeleteSectionCommand) {
    const section = await this.sectionRepository.findById(command.id);

    if (!section) {
      throw new AppException(ErrorCode.SECTION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const course = await this.courseRepository.findById(section.courseId);
    if (course && !EDITABLE_STATUSES.includes(course.status)) {
      throw new AppException(ErrorCode.COURSE_NOT_EDITABLE, HttpStatus.FORBIDDEN);
    }

    await this.sectionRepository.delete(command.id);

    return {
      success: true,
    };
  }
}
