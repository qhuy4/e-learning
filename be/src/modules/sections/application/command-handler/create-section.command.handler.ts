import { ConflictException, Inject, NotFoundException } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import slugify from 'slugify';

import { CreateSectionCommand } from '../command/create-section.command';

import { Section } from '../../domain/entity/section.entity';

import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '../../../courses/domain/repository/course.repository';

import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '../../domain/repository/section.repository';

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
      throw new NotFoundException('Course not found');
    }

    const slug = slugify(command.title, {
      lower: true,
      strict: true,
      trim: true,
    });

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
