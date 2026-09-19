import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PublishExamCommand } from '../command/publish-exam.command';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';
import { ExamStatus } from '../../domain/enums/exam-status.enum';

@CommandHandler(PublishExamCommand)
export class PublishExamHandler
  implements ICommandHandler<PublishExamCommand>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
  ) {}

  async execute(command: PublishExamCommand) {
    const exam = await this.examRepo.findById(command.id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    exam.update({ status: ExamStatus.PUBLISHED });
    exam.publishedAt = new Date();
    return this.examRepo.update(exam);
  }
}
