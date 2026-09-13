import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminRevenueSummaryQuery } from '@/modules/instructor-payouts/application/query/get-admin-revenue-summary.query';
import {
  IRevenueSplitRepository,
  REVENUE_SPLIT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/revenue-split.repository';

@QueryHandler(GetAdminRevenueSummaryQuery)
export class GetAdminRevenueSummaryHandler implements IQueryHandler<GetAdminRevenueSummaryQuery> {
  constructor(
    @Inject(REVENUE_SPLIT_REPOSITORY)
    private readonly revenueSplitRepository: IRevenueSplitRepository,
  ) {}

  async execute(query: GetAdminRevenueSummaryQuery) {
    return this.revenueSplitRepository.getSummary(query.data);
  }
}
