import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteExamMaterialCommand } from '../command/delete-exam-material.command';
import {
  IExamMaterialRepository,
  EXAM_MATERIAL_REPOSITORY,
} from '../../domain/repository/exam-material.repository';

@CommandHandler(DeleteExamMaterialCommand)
export class DeleteExamMaterialHandler
  implements ICommandHandler<DeleteExamMaterialCommand>
{
  constructor(
    @Inject(EXAM_MATERIAL_REPOSITORY)
    private readonly examMaterialRepo: IExamMaterialRepository,
  ) {}

  async execute(command: DeleteExamMaterialCommand) {
    const material = await this.examMaterialRepo.findById(command.id);
    if (!material) {
      throw new NotFoundException('ExamMaterial not found');
    }
    await this.examMaterialRepo.delete(command.id);
    return { success: true };
  }
}
