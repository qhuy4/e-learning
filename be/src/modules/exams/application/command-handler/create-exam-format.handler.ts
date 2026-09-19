import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateExamFormatCommand } from '../command/create-exam-format.command';
import {
  IExamFormatRepository,
  EXAM_FORMAT_REPOSITORY,
} from '../../domain/repository/exam-format.repository';
import {
  IExamFormatSectionRepository,
  EXAM_FORMAT_SECTION_REPOSITORY,
} from '../../domain/repository/exam-format-section.repository';
import { ExamFormat } from '../../domain/entity/exam-format.entity';
import { ExamFormatSection } from '../../domain/entity/exam-format-section.entity';

@CommandHandler(CreateExamFormatCommand)
export class CreateExamFormatHandler
  implements ICommandHandler<CreateExamFormatCommand>
{
  constructor(
    @Inject(EXAM_FORMAT_REPOSITORY)
    private readonly examFormatRepo: IExamFormatRepository,
    @Inject(EXAM_FORMAT_SECTION_REPOSITORY)
    private readonly examFormatSectionRepo: IExamFormatSectionRepository,
  ) {}

  async execute(command: CreateExamFormatCommand): Promise<any> {
    const format = ExamFormat.create({
      examTypeId: command.dto.examTypeId,
      code: command.dto.code,
      name: command.dto.name,
      version: command.dto.version ? Number(command.dto.version) : undefined,
      description: command.dto.description,
      durationSeconds: command.dto.durationSeconds ?? 0,
      isActive: command.dto.isActive,
      effectiveFrom: command.dto.effectiveFrom
        ? new Date(command.dto.effectiveFrom)
        : undefined,
      effectiveTo: command.dto.effectiveTo
        ? new Date(command.dto.effectiveTo)
        : undefined,
    });

    const savedFormat = await this.examFormatRepo.create(format);

    if (command.dto.sections && command.dto.sections.length > 0) {
      const sections = command.dto.sections.map((s) =>
        ExamFormatSection.create({
          examFormatId: savedFormat.id!,
          code: s.code,
          name: s.name,
          description: s.description,
          instructions: s.instructions,
          position: s.position,
          durationSeconds: s.durationSeconds ?? 0,
          questionCount: s.questionCount,
        }),
      );
      await this.examFormatSectionRepo.saveAll(sections);
    }

    return savedFormat;
  }
}
