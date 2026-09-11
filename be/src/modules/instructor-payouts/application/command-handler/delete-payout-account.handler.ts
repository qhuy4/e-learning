import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeletePayoutAccountCommand } from '@/modules/instructor-payouts/application/command/delete-payout-account.command';
import {
  IPayoutAccountRepository,
  PAYOUT_ACCOUNT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/payout-account.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(DeletePayoutAccountCommand)
export class DeletePayoutAccountHandler implements ICommandHandler<DeletePayoutAccountCommand> {
  constructor(
    @Inject(PAYOUT_ACCOUNT_REPOSITORY)
    private readonly payoutAccountRepository: IPayoutAccountRepository,
  ) {}

  async execute(command: DeletePayoutAccountCommand) {
    const existing = await this.payoutAccountRepository.findById(command.data.id);
    if (!existing) {
      throw new AppException(ErrorCode.PAYOUT_ACCOUNT_NOT_FOUND, 404);
    }

    await this.payoutAccountRepository.delete(command.data.id);
  }
}
