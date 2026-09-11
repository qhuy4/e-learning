import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetInstructorPayoutAccountsQuery } from '@/modules/instructor-payouts/application/query/get-instructor-payout-accounts.query';
import {
  IPayoutAccountRepository,
  PAYOUT_ACCOUNT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/payout-account.repository';

@QueryHandler(GetInstructorPayoutAccountsQuery)
export class GetInstructorPayoutAccountsHandler implements IQueryHandler<GetInstructorPayoutAccountsQuery> {
  constructor(
    @Inject(PAYOUT_ACCOUNT_REPOSITORY)
    private readonly payoutAccountRepository: IPayoutAccountRepository,
  ) {}

  async execute(query: GetInstructorPayoutAccountsQuery) {
    return this.payoutAccountRepository.findByInstructorProfileId(query.data.instructorProfileId);
  }
}
