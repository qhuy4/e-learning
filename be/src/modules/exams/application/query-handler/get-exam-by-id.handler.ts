import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetExamByIdQuery } from '../query/get-exam-by-id.query';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';

@QueryHandler(GetExamByIdQuery)
export class GetExamByIdHandler
  implements IQueryHandler<GetExamByIdQuery>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
  ) {}

  async execute(query: GetExamByIdQuery) {
    const exam = await this.examRepo.findById(query.id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }
}
