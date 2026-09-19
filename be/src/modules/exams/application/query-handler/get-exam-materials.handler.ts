import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExamMaterialsQuery } from '../query/get-exam-materials.query';
import {
  IExamMaterialRepository,
  EXAM_MATERIAL_REPOSITORY,
} from '../../domain/repository/exam-material.repository';

@QueryHandler(GetExamMaterialsQuery)
export class GetExamMaterialsHandler
  implements IQueryHandler<GetExamMaterialsQuery>
{
  constructor(
    @Inject(EXAM_MATERIAL_REPOSITORY)
    private readonly examMaterialRepo: IExamMaterialRepository,
  ) {}

  async execute(query: GetExamMaterialsQuery) {
    return this.examMaterialRepo.findBySectionId(query.sectionId);
  }
}
