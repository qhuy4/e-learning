import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CreateExamCommand } from '../command/create-exam.command';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';
import {
  IExamFormatRepository,
  EXAM_FORMAT_REPOSITORY,
} from '../../domain/repository/exam-format.repository';
import {
  IExamFormatSectionRepository,
  EXAM_FORMAT_SECTION_REPOSITORY,
} from '../../domain/repository/exam-format-section.repository';
import {
  IExamSectionRepository,
  EXAM_SECTION_REPOSITORY,
} from '../../domain/repository/exam-section.repository';
import { Exam } from '../../domain/entity/exam.entity';
import { ExamSection } from '../../domain/entity/exam-section.entity';

@CommandHandler(CreateExamCommand)
export class CreateExamHandler
  implements ICommandHandler<CreateExamCommand>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
    @Inject(EXAM_FORMAT_REPOSITORY)
    private readonly examFormatRepo: IExamFormatRepository,
    @Inject(EXAM_FORMAT_SECTION_REPOSITORY)
    private readonly examFormatSectionRepo: IExamFormatSectionRepository,
    @Inject(EXAM_SECTION_REPOSITORY)
    private readonly examSectionRepo: IExamSectionRepository,
  ) {}

  async execute(command: CreateExamCommand): Promise<any> {
    const format = await this.examFormatRepo.findById(
      command.dto.examFormatId,
    );
    if (!format) {
      throw new NotFoundException('ExamFormat not found');
    }

    const exam = Exam.create({
      examFormatId: command.dto.examFormatId,
      title: command.dto.title,
      description: command.dto.description,
      isPremium: command.dto.isPremium,
      durationSeconds:
        command.dto.durationSeconds ?? format.durationSeconds,
      createdBy: command.dto.createdBy,
    });

    const savedExam = await this.examRepo.create(exam);

    const formatSections = await this.examFormatSectionRepo.findByExamFormatId(
      command.dto.examFormatId,
    );

    if (formatSections.length > 0) {
      const sections = formatSections.map((fs) =>
        ExamSection.create({
          examId: savedExam.id!,
          formatSectionId: fs.id!,
          code: fs.code,
          name: fs.name,
          instructions: fs.instructions,
          position: fs.position,
          durationSeconds: fs.durationSeconds,
        }),
      );
      await this.examSectionRepo.saveAll(sections);
    }

    const sections = await this.examSectionRepo.findByExamId(savedExam.id!);

    return { ...savedExam, sections };
  }
}
