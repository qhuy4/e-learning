import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPublishedExamsQuery } from '../query/get-published-exams.query';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';
import { ExamStatus } from '../../domain/enums/exam-status.enum';

@QueryHandler(GetPublishedExamsQuery)
export class GetPublishedExamsHandler
  implements IQueryHandler<GetPublishedExamsQuery>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
  ) {}

  async execute() {
    return this.examRepo.findByStatus(ExamStatus.PUBLISHED);
  }
}
