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
  IExamGroupMaterialRepository,
  EXAM_GROUP_MATERIAL_REPOSITORY,
} from '../../domain/repository/exam-group-material.repository';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';
import {
  IExamOptionRepository,
  EXAM_OPTION_REPOSITORY,
} from '../../domain/repository/exam-option.repository';
import {
  IExamQuestionGroupRepository,
  EXAM_QUESTION_GROUP_REPOSITORY,
} from '../../domain/repository/exam-question-group.repository';
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
    @Inject(EXAM_GROUP_MATERIAL_REPOSITORY)
    private readonly groupMaterialRepo: IExamGroupMaterialRepository,
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly examOptionRepo: IExamOptionRepository,
    @Inject(EXAM_QUESTION_GROUP_REPOSITORY)
    private readonly groupRepo: IExamQuestionGroupRepository,
  ) {}

  async execute(query: GetStudentExamDetailQuery) {
    // findByIdWithTypeName → response includes examTypeName + examFormatName
    // (loại đề / định dạng đề) so the FE detail page can display them.
    const exam = await this.examRepo.findByIdWithTypeName(query.id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    if (exam.status !== ExamStatus.PUBLISHED) {
      throw new BadRequestException('Exam is not published');
    }

    const sections = await this.examSectionRepo.findByExamId(query.id);

    const sectionsWithDetails = await Promise.all(
      sections.map(async (section) => {
        const groups = await this.groupRepo.findBySectionId(section.id!);
        const directQuestions = await this.examQuestionRepo.findBySectionId(
          section.id!,
        );

        const directQuestionsWithOptions = await Promise.all(
          directQuestions.map(async (question) => {
            const options = await this.examOptionRepo.findByQuestionId(
              question.id!,
            );
            return { ...question, options };
          }),
        );

        const groupsWithDetails = await Promise.all(
          groups.map(async (group) => {
            const materials = await this.groupMaterialRepo.findByGroupId(
              group.id!,
            );
            const questions = await this.examQuestionRepo.findByGroupId(
              group.id!,
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
              ...group,
              materials,
              questions: questionsWithOptions,
            };
          }),
        );

        return {
          ...section,
          questions: directQuestionsWithOptions,
          groups: groupsWithDetails,
        };
      }),
    );

    return { ...exam, sections: sectionsWithDetails };
  }
}
