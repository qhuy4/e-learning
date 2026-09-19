import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateExamTypeCommand } from '../command/update-exam-type.command';
import {
  IExamTypeRepository,
  EXAM_TYPE_REPOSITORY,
} from '../../domain/repository/exam-type.repository';

@CommandHandler(UpdateExamTypeCommand)
export class UpdateExamTypeHandler
  implements ICommandHandler<UpdateExamTypeCommand>
{
  constructor(
    @Inject(EXAM_TYPE_REPOSITORY)
    private readonly examTypeRepo: IExamTypeRepository,
  ) {}

  async execute(command: UpdateExamTypeCommand) {
    const examType = await this.examTypeRepo.findById(command.id);
    if (!examType) {
      throw new NotFoundException('ExamType not found');
    }
    examType.update({
      code: command.dto.code,
      name: command.dto.name,
      description: command.dto.description,
    });
    return this.examTypeRepo.update(examType);
  }
}
