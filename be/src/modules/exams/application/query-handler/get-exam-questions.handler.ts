import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExamQuestionsQuery } from '../query/get-exam-questions.query';
import {
  IExamQuestionRepository,
  EXAM_QUESTION_REPOSITORY,
} from '../../domain/repository/exam-question.repository';

@QueryHandler(GetExamQuestionsQuery)
export class GetExamQuestionsHandler
  implements IQueryHandler<GetExamQuestionsQuery>
{
  constructor(
    @Inject(EXAM_QUESTION_REPOSITORY)
    private readonly examQuestionRepo: IExamQuestionRepository,
  ) {}

  async execute(query: GetExamQuestionsQuery) {
    return this.examQuestionRepo.findBySectionId(query.sectionId);
  }
}
