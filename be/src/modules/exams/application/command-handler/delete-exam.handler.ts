import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteExamCommand } from '../command/delete-exam.command';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';

@CommandHandler(DeleteExamCommand)
export class DeleteExamHandler
  implements ICommandHandler<DeleteExamCommand>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
  ) {}

  async execute(command: DeleteExamCommand) {
    const exam = await this.examRepo.findById(command.id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    await this.examRepo.delete(command.id);
    return { success: true };
  }
}
