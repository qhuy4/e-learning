import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdatePayoutStatusCommand } from '@/modules/instructor-payouts/application/command/update-payout-status.command';
import {
  IInstructorPayoutRepository,
  INSTRUCTOR_PAYOUT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/instructor-payout.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { PayoutStatus } from '@/modules/instructor-payouts/domain/enum/payout-status.enum';

@CommandHandler(UpdatePayoutStatusCommand)
export class UpdatePayoutStatusHandler implements ICommandHandler<UpdatePayoutStatusCommand> {
  constructor(
    @Inject(INSTRUCTOR_PAYOUT_REPOSITORY)
    private readonly payoutRepository: IInstructorPayoutRepository,
  ) {}

  async execute(command: UpdatePayoutStatusCommand) {
    const { id, status, transactionRef, paidAt, note } = command.data;

    const existing = await this.payoutRepository.findById(id);
    if (!existing) {
      throw new AppException(ErrorCode.PAYOUT_NOT_FOUND, 404);
    }

    if (existing.status === PayoutStatus.PAID) {
      throw new AppException(ErrorCode.PAYOUT_ALREADY_PROCESSED, 400);
    }

    return this.payoutRepository.updateStatus(id, {
      status,
      transactionRef,
      paidAt: paidAt ? new Date(paidAt) : undefined,
      note,
    });
  }
}
