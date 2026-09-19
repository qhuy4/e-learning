import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CreateExamTypeCommand } from '../command/create-exam-type.command';
import {
  IExamTypeRepository,
  EXAM_TYPE_REPOSITORY,
} from '../../domain/repository/exam-type.repository';
import { ExamType } from '../../domain/entity/exam-type.entity';

@CommandHandler(CreateExamTypeCommand)
export class CreateExamTypeHandler
  implements ICommandHandler<CreateExamTypeCommand>
{
  constructor(
    @Inject(EXAM_TYPE_REPOSITORY)
    private readonly examTypeRepo: IExamTypeRepository,
  ) {}

  async execute(command: CreateExamTypeCommand): Promise<ExamType> {
    const examType = ExamType.create({
      code: command.dto.code,
      name: command.dto.name,
      description: command.dto.description,
    });
    return this.examTypeRepo.create(examType);
  }
}
