import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminQuestionsQuery } from '@/modules/course-questions/application/query/get-admin-questions.query';
import {
  ICourseQuestionRepository,
  COURSE_QUESTION_REPOSITORY,
} from '@/modules/course-questions/domain/repository/course-question.repository';

@QueryHandler(GetAdminQuestionsQuery)
export class GetAdminQuestionsHandler implements IQueryHandler<GetAdminQuestionsQuery> {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly questionRepository: ICourseQuestionRepository,
  ) {}

  async execute(query: GetAdminQuestionsQuery) {
    return this.questionRepository.findAll(query.data);
  }
}
