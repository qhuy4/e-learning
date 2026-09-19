import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExamsByTypeQuery } from '../query/get-exams-by-type.query';
import {
  IExamFormatRepository,
  EXAM_FORMAT_REPOSITORY,
} from '../../domain/repository/exam-format.repository';
import {
  IExamRepository,
  EXAM_REPOSITORY,
} from '../../domain/repository/exam.repository';
import { Exam } from '../../domain/entity/exam.entity';

@QueryHandler(GetExamsByTypeQuery)
export class GetExamsByTypeHandler
  implements IQueryHandler<GetExamsByTypeQuery>
{
  constructor(
    @Inject(EXAM_REPOSITORY)
    private readonly examRepo: IExamRepository,
    @Inject(EXAM_FORMAT_REPOSITORY)
    private readonly examFormatRepo: IExamFormatRepository,
  ) {}

  async execute(query: GetExamsByTypeQuery): Promise<Exam[]> {
    const allExams = await this.examRepo.findAll();
    const formats = await this.examFormatRepo.findByExamTypeId(
      query.examTypeId,
    );
    const formatIds = new Set(formats.map((f) => f.id));
    return allExams.filter((exam) => formatIds.has(exam.examFormatId));
  }
}
