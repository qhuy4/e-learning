import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteExamTypeCommand } from '../command/delete-exam-type.command';
import {
  IExamTypeRepository,
  EXAM_TYPE_REPOSITORY,
} from '../../domain/repository/exam-type.repository';

@CommandHandler(DeleteExamTypeCommand)
export class DeleteExamTypeHandler
  implements ICommandHandler<DeleteExamTypeCommand>
{
  constructor(
    @Inject(EXAM_TYPE_REPOSITORY)
    private readonly examTypeRepo: IExamTypeRepository,
  ) {}

  async execute(command: DeleteExamTypeCommand) {
    const examType = await this.examTypeRepo.findById(command.id);
    if (!examType) {
      throw new NotFoundException('ExamType not found');
    }
    await this.examTypeRepo.delete(command.id);
    return { success: true };
  }
}
