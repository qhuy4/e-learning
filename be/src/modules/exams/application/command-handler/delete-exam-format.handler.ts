import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteExamFormatCommand } from '../command/delete-exam-format.command';
import {
  IExamFormatRepository,
  EXAM_FORMAT_REPOSITORY,
} from '../../domain/repository/exam-format.repository';

@CommandHandler(DeleteExamFormatCommand)
export class DeleteExamFormatHandler
  implements ICommandHandler<DeleteExamFormatCommand>
{
  constructor(
    @Inject(EXAM_FORMAT_REPOSITORY)
    private readonly examFormatRepo: IExamFormatRepository,
  ) {}

  async execute(command: DeleteExamFormatCommand) {
    const format = await this.examFormatRepo.findById(command.id);
    if (!format) {
      throw new NotFoundException('ExamFormat not found');
    }
    await this.examFormatRepo.delete(command.id);
    return { success: true };
  }
}
