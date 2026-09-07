import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import slugify from 'slugify';

import { UpdateSectionCommand } from '@/modules/sections/application/command/update-section.command';

import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '@/modules/sections/domain/repository/section.repository';

import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';

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
      throw new NotFoundException('Section not found');
    }

    const course = await this.courseRepository.findById(section.courseId);
    if (course && !EDITABLE_STATUSES.includes(course.status)) {
      throw new ForbiddenException('Không thể chỉnh sửa khóa học ở trạng thái hiện tại.');
    }

    const slug = command.data.title
      ? slugify(command.data.title, {
          lower: true,
          strict: true,
          trim: true,
        })
      : undefined;

    section.update({
      ...command.data,
      slug,
    });

    return this.sectionRepository.update(section);
  }
}
