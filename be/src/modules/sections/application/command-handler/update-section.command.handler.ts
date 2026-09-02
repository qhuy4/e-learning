import { Inject, NotFoundException } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import slugify from 'slugify';

import { UpdateSectionCommand } from '../command/update-section.command';

import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '../../domain/repository/section.repository';

@CommandHandler(UpdateSectionCommand)
export class UpdateSectionHandler implements ICommandHandler<UpdateSectionCommand> {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
  ) {}

  async execute(command: UpdateSectionCommand) {
    const section = await this.sectionRepository.findById(command.id);

    if (!section) {
      throw new NotFoundException('Section not found');
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
