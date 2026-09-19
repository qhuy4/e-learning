import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateExamMaterialCommand } from '../command/create-exam-material.command';
import {
  IExamMaterialRepository,
  EXAM_MATERIAL_REPOSITORY,
} from '../../domain/repository/exam-material.repository';
import { ExamMaterial } from '../../domain/entity/exam-material.entity';

@CommandHandler(CreateExamMaterialCommand)
export class CreateExamMaterialHandler
  implements ICommandHandler<CreateExamMaterialCommand>
{
  constructor(
    @Inject(EXAM_MATERIAL_REPOSITORY)
    private readonly examMaterialRepo: IExamMaterialRepository,
  ) {}

  async execute(command: CreateExamMaterialCommand) {
    const material = ExamMaterial.create({
      sectionId: command.dto.sectionId,
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
