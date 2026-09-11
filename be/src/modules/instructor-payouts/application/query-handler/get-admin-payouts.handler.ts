import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminPayoutsQuery } from '@/modules/instructor-payouts/application/query/get-admin-payouts.query';
import {
  IInstructorPayoutRepository,
  INSTRUCTOR_PAYOUT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/instructor-payout.repository';

@QueryHandler(GetAdminPayoutsQuery)
export class GetAdminPayoutsHandler implements IQueryHandler<GetAdminPayoutsQuery> {
  constructor(
    @Inject(INSTRUCTOR_PAYOUT_REPOSITORY)
    private readonly payoutRepository: IInstructorPayoutRepository,
  ) {}

  async execute(query: GetAdminPayoutsQuery) {
    return this.payoutRepository.findAll(query.data);
  }
}
