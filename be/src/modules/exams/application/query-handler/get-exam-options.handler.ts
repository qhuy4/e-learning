import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExamOptionsQuery } from '../query/get-exam-options.query';
import {
  IExamOptionRepository,
  EXAM_OPTION_REPOSITORY,
} from '../../domain/repository/exam-option.repository';

@QueryHandler(GetExamOptionsQuery)
export class GetExamOptionsHandler
  implements IQueryHandler<GetExamOptionsQuery>
{
  constructor(
    @Inject(EXAM_OPTION_REPOSITORY)
    private readonly examOptionRepo: IExamOptionRepository,
  ) {}

  async execute(query: GetExamOptionsQuery) {
    return this.examOptionRepo.findByQuestionId(query.questionId);
  }
}
