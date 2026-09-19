import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateExamFormatCommand } from '../command/update-exam-format.command';
import {
  IExamFormatRepository,
  EXAM_FORMAT_REPOSITORY,
} from '../../domain/repository/exam-format.repository';

@CommandHandler(UpdateExamFormatCommand)
export class UpdateExamFormatHandler
  implements ICommandHandler<UpdateExamFormatCommand>
{
  constructor(
    @Inject(EXAM_FORMAT_REPOSITORY)
    private readonly examFormatRepo: IExamFormatRepository,
  ) {}

  async execute(command: UpdateExamFormatCommand) {
    const format = await this.examFormatRepo.findById(command.id);
    if (!format) {
      throw new NotFoundException('ExamFormat not found');
    }
    format.update({
      code: command.dto.code,
      name: command.dto.name,
      version: command.dto.version ? Number(command.dto.version) : undefined,
      description: command.dto.description,
      durationSeconds: command.dto.durationSeconds,
      isActive: command.dto.isActive,
      effectiveFrom: command.dto.effectiveFrom
        ? new Date(command.dto.effectiveFrom)
        : undefined,
      effectiveTo: command.dto.effectiveTo
        ? new Date(command.dto.effectiveTo)
        : undefined,
    });
    return this.examFormatRepo.update(format);
  }
}
