import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateExamCommand } from '../command/update-exam.command';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';

@CommandHandler(UpdateExamCommand)
export class UpdateExamHandler
  implements ICommandHandler<UpdateExamCommand>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
  ) {}

  async execute(command: UpdateExamCommand) {
    const exam = await this.examRepo.findById(command.id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    exam.update({
      title: command.dto.title,
      description: command.dto.description,
      isPremium: command.dto.isPremium,
      durationSeconds: command.dto.durationSeconds,
    });
    return this.examRepo.update(exam);
  }
}
