import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { GetStudentExamDetailQuery } from '../query/get-student-exam-detail.query';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';
import {
  IExamSectionRepository,
  EXAM_SECTION_REPOSITORY,
} from '../../domain/repository/exam-section.repository';
import {
  IExamMaterialRepository,
  EXAM_MATERIAL_REPOSITORY,
} from '../../domain/repository/exam-material.repository';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';
import {
  IExamOptionRepository,
  EXAM_OPTION_REPOSITORY,
} from '../../domain/repository/exam-option.repository';
import { ExamStatus } from '../../domain/enums/exam-status.enum';

@QueryHandler(GetStudentExamDetailQuery)
export class GetStudentExamDetailHandler
  implements IQueryHandler<GetStudentExamDetailQuery>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
    @Inject(EXAM_SECTION_REPOSITORY)
    private readonly examSectionRepo: IExamSectionRepository,
    @Inject(EXAM_MATERIAL_REPOSITORY)
    private readonly examMaterialRepo: IExamMaterialRepository,
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly examOptionRepo: IExamOptionRepository,
  ) {}

  async execute(query: GetStudentExamDetailQuery) {
    const exam = await this.examRepo.findById(query.id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    if (exam.status !== ExamStatus.PUBLISHED) {
      throw new BadRequestException('Exam is not published');
    }

    const sections = await this.examSectionRepo.findByExamId(query.id);

    const sectionsWithDetails = await Promise.all(
      sections.map(async (section) => {
        const materials = await this.examMaterialRepo.findBySectionId(
          section.id!,
        );
        const questions = await this.examQuestionRepo.findBySectionId(
          section.id!,
        );

        const questionsWithOptions = await Promise.all(
          questions.map(async (question) => {
            const options = await this.examOptionRepo.findByQuestionId(
              question.id!,
            );
            return { ...question, options };
          }),
        );

        return {
          ...section,
          materials,
          questions: questionsWithOptions,
        };
      }),
    );

    return { ...exam, sections: sectionsWithDetails };
  }
}
