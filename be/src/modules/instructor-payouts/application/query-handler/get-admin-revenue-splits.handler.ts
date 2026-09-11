import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminRevenueSplitsQuery } from '@/modules/instructor-payouts/application/query/get-admin-revenue-splits.query';
import {
  IRevenueSplitRepository,
  REVENUE_SPLIT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/revenue-split.repository';

@QueryHandler(GetAdminRevenueSplitsQuery)
export class GetAdminRevenueSplitsHandler implements IQueryHandler<GetAdminRevenueSplitsQuery> {
  constructor(
    @Inject(REVENUE_SPLIT_REPOSITORY)
    private readonly revenueSplitRepository: IRevenueSplitRepository,
  ) {}

  async execute(query: GetAdminRevenueSplitsQuery) {
    return this.revenueSplitRepository.findAll(query.data);
  }
}
