import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExamSectionsQuery } from '../query/get-exam-sections.query';
import {
  IExamSectionRepository,
  EXAM_SECTION_REPOSITORY,
} from '../../domain/repository/exam-section.repository';

@QueryHandler(GetExamSectionsQuery)
export class GetExamSectionsHandler
  implements IQueryHandler<GetExamSectionsQuery>
{
  constructor(
    @Inject(EXAM_SECTION_REPOSITORY)
    private readonly examSectionRepo: IExamSectionRepository,
  ) {}

  async execute(query: GetExamSectionsQuery) {
    return this.examSectionRepo.findByExamId(query.examId);
  }
}
