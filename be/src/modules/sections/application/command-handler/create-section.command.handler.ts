import {
  ConflictException,
  Inject,
  HttpStatus,
} from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateSectionCommand } from '@/modules/sections/application/command/create-section.command';

import { Section } from '@/modules/sections/domain/entity/section.entity';

import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '@/modules/courses/domain/repository/course.repository';

import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '@/modules/sections/domain/repository/section.repository';
import { SlugUtil } from '@/common/utils/slug.util';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

// DRAFT(1), APPROVED(3), REJECTED(4), PUBLISHED(5) — chặn PENDING_REVIEW(2) & ARCHIVED(6)
const EDITABLE_STATUSES = [1, 3, 4, 5];

@CommandHandler(CreateSectionCommand)
export class CreateSectionHandler implements ICommandHandler<CreateSectionCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
  ) {}

  async execute(command: CreateSectionCommand) {
    const course = await this.courseRepository.findById(command.courseId);

    if (!course) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const slug = SlugUtil.generate(command.title);
    if (!EDITABLE_STATUSES.includes(course.status)) {
      throw new AppException(ErrorCode.COURSE_NOT_EDITABLE, HttpStatus.FORBIDDEN);
    }

    const existingSection = await this.sectionRepository.findBySlug(
      command.courseId,
      slug,
    );

    if (existingSection) {
      throw new ConflictException('Section slug already exists');
    }

    const section = Section.create({
      courseId: command.courseId,
      title: command.title,
      slug,
      description: command.description,
      position: command.position,
      isActive: command.isActive,
    });

    return this.sectionRepository.create(section);
  }
}
