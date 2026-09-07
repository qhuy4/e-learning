import { Inject, NotFoundException } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteSectionCommand } from '@/modules/sections/application/command/delete-section.command';

import {
  SECTION_REPOSITORY,
  ISectionRepository,
} from '@/modules/sections/domain/repository/section.repository';

@CommandHandler(DeleteSectionCommand)
export class DeleteSectionHandler implements ICommandHandler<DeleteSectionCommand> {
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: ISectionRepository,
  ) {}

  async execute(command: DeleteSectionCommand) {
    const section = await this.sectionRepository.findById(command.id);

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    await this.sectionRepository.delete(command.id);

    return {
      success: true,
    };
  }
}
