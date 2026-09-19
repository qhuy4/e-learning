import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ArchiveExamCommand } from '../command/archive-exam.command';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';
import { ExamStatus } from '../../domain/enums/exam-status.enum';

@CommandHandler(ArchiveExamCommand)
export class ArchiveExamHandler
  implements ICommandHandler<ArchiveExamCommand>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
  ) {}

  async execute(command: ArchiveExamCommand) {
    const exam = await this.examRepo.findById(command.id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    exam.update({ status: ExamStatus.ARCHIVED });
    return this.examRepo.update(exam);
  }
}
