import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExamAttemptsQuery } from '../query/get-exam-attempts.query';
import {
  IExamAttemptRepository,
  EXAM_ATTEMPT_REPOSITORY,
} from '../../domain/repository/exam-attempt.repository';

@QueryHandler(GetExamAttemptsQuery)
export class GetExamAttemptsHandler
  implements IQueryHandler<GetExamAttemptsQuery>
{
  constructor(
    @Inject(EXAM_ATTEMPT_REPOSITORY)
    private readonly examAttemptRepo: IExamAttemptRepository,
  ) {}

  async execute(query: GetExamAttemptsQuery) {
    const allAttempts = await this.examAttemptRepo.findByExamAndUser(
      query.examId,
      0,
    );
    return Array.isArray(allAttempts) ? allAttempts : allAttempts ? [allAttempts] : [];
  }
}
