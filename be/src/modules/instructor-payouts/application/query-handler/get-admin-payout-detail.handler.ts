import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminPayoutDetailQuery } from '@/modules/instructor-payouts/application/query/get-admin-payout-detail.query';
import {
  IInstructorPayoutRepository,
  INSTRUCTOR_PAYOUT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/instructor-payout.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@QueryHandler(GetAdminPayoutDetailQuery)
export class GetAdminPayoutDetailHandler implements IQueryHandler<GetAdminPayoutDetailQuery> {
  constructor(
    @Inject(INSTRUCTOR_PAYOUT_REPOSITORY)
    private readonly payoutRepository: IInstructorPayoutRepository,
  ) {}

  async execute(query: GetAdminPayoutDetailQuery) {
    const payout = await this.payoutRepository.findById(query.data.id);
    if (!payout) {
      throw new AppException(ErrorCode.PAYOUT_NOT_FOUND, 404);
    }
    return payout;
  }
}
