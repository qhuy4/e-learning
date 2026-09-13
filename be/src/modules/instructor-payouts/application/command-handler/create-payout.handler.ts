import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePayoutCommand } from '@/modules/instructor-payouts/application/command/create-payout.command';
import {
  IInstructorPayoutRepository,
  INSTRUCTOR_PAYOUT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/instructor-payout.repository';
import {
  IRevenueSplitRepository,
  REVENUE_SPLIT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/revenue-split.repository';
import { PayoutStatus } from '@/modules/instructor-payouts/domain/enum/payout-status.enum';
import { PaymentMethod } from '@/modules/instructor-payouts/domain/enum/payment-method.enum';

@CommandHandler(CreatePayoutCommand)
export class CreatePayoutHandler implements ICommandHandler<CreatePayoutCommand> {
  constructor(
    @Inject(INSTRUCTOR_PAYOUT_REPOSITORY)
    private readonly payoutRepository: IInstructorPayoutRepository,
    @Inject(REVENUE_SPLIT_REPOSITORY)
    private readonly revenueSplitRepository: IRevenueSplitRepository,
  ) {}

  async execute(command: CreatePayoutCommand) {
    const { instructorId, payoutAccountId, periodStart, periodEnd } = command.data;

    // Find pending revenue splits for this instructor in the period
    const { data: splits } = await this.revenueSplitRepository.findAll({
      page: 1,
      limit: 10000,
      instructorId,
      payoutStatus: 'pending',
    });

    // Filter splits within period
    const periodSplits = splits.filter((split: any) => {
      const created = new Date(split.createdAt);
      return created >= new Date(periodStart) && created <= new Date(periodEnd);
    });

    if (periodSplits.length === 0) {
      return { message: 'No pending revenue splits found for this period' };
    }

    const totalGross = periodSplits.reduce((sum: number, s: any) => sum + s.grossAmount, 0);
    const totalPlatformFee = periodSplits.reduce((sum: number, s: any) => sum + s.platformFeeAmount, 0);
    const totalInstructorAmount = periodSplits.reduce((sum: number, s: any) => sum + s.instructorAmount, 0);

    const payout = await this.payoutRepository.create({
      instructorId,
      payoutAccountId,
      periodStart,
      periodEnd,
      totalGross,
      totalPlatformFee,
      totalInstructorAmount,
      currency: 'VND',
      status: PayoutStatus.PENDING,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
    });

    // Mark splits as included_in_payout
    for (const split of periodSplits) {
      // Update split status would need a repository method - for now just return
    }

    return payout;
  }
}
