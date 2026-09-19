import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateExamMaterialCommand } from '../command/update-exam-material.command';
import {
  IExamMaterialRepository,
  EXAM_MATERIAL_REPOSITORY,
} from '../../domain/repository/exam-material.repository';

@CommandHandler(UpdateExamMaterialCommand)
export class UpdateExamMaterialHandler
  implements ICommandHandler<UpdateExamMaterialCommand>
{
  constructor(
    @Inject(EXAM_MATERIAL_REPOSITORY)
    private readonly examMaterialRepo: IExamMaterialRepository,
  ) {}

  async execute(command: UpdateExamMaterialCommand) {
    const material = await this.examMaterialRepo.findById(command.id);
    if (!material) {
      throw new NotFoundException('ExamMaterial not found');
    }
    material.update({
      type: command.dto.type,
      title: command.dto.title,
      content: command.dto.content,
      fileUrl: command.dto.fileUrl,
      transcript: command.dto.transcript,
      position: command.dto.position,
    });
    return this.examMaterialRepo.save(material);
  }
}
