import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExamAnswersQuery } from '../query/get-exam-answers.query';
import {
  IExamAnswerRepository,
  EXAM_ANSWER_REPOSITORY,
} from '../../domain/repository/exam-answer.repository';

@QueryHandler(GetExamAnswersQuery)
export class GetExamAnswersHandler
  implements IQueryHandler<GetExamAnswersQuery>
{
  constructor(
    @Inject(EXAM_ANSWER_REPOSITORY)
    private readonly examAnswerRepo: IExamAnswerRepository,
  ) {}

  async execute(query: GetExamAnswersQuery) {
    return this.examAnswerRepo.findByAttemptId(query.attemptId);
  }
}
