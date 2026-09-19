import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExamListQuery } from '../query/get-exam-list.query';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';

@QueryHandler(GetExamListQuery)
export class GetExamListHandler
  implements IQueryHandler<GetExamListQuery>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
  ) {}

  async execute() {
    return this.examRepo.findAll();
  }
}
