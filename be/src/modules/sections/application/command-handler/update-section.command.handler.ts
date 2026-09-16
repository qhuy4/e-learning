import { Inject, HttpStatus } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SlugUtil } from '../../../../common/utils/slug.util';

import { UpdateSectionCommand } from '@/modules/sections/application/command/update-section.command';

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

const EDITABLE_STATUSES = [1, 4];

@CommandHandler(UpdateSectionCommand)
export class UpdateSectionHandler implements ICommandHandler<UpdateSectionCommand> {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,

    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: UpdateSectionCommand) {
    const section = await this.sectionRepository.findById(command.id);

    if (!section) {
      throw new AppException(ErrorCode.SECTION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const course = await this.courseRepository.findById(section.courseId);
    if (course && !EDITABLE_STATUSES.includes(course.status)) {
      throw new AppException(ErrorCode.COURSE_NOT_EDITABLE, HttpStatus.FORBIDDEN);
    }

    const slug = command.data.title
      ? SlugUtil.generate(command.data.title)
      : undefined;

    section.update({
      ...command.data,
      slug,
    });

    return this.sectionRepository.update(section);
  }
}
