import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminQuestionDetailQuery } from '@/modules/course-questions/application/query/get-admin-question-detail.query';
import {
  ICourseQuestionRepository,
  COURSE_QUESTION_REPOSITORY,
} from '@/modules/course-questions/domain/repository/course-question.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@QueryHandler(GetAdminQuestionDetailQuery)
export class GetAdminQuestionDetailHandler implements IQueryHandler<GetAdminQuestionDetailQuery> {
  constructor(
    @Inject(COURSE_QUESTION_REPOSITORY)
    private readonly questionRepository: ICourseQuestionRepository,
  ) {}

  async execute(query: GetAdminQuestionDetailQuery) {
    const question = await this.questionRepository.findById(query.data.id);
    if (!question) {
      throw new AppException(ErrorCode.COURSE_QUESTION_NOT_FOUND, 404);
    }
    return question;
  }
}
