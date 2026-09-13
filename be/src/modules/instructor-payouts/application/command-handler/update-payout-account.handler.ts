import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdatePayoutAccountCommand } from '@/modules/instructor-payouts/application/command/update-payout-account.command';
import {
  IPayoutAccountRepository,
  PAYOUT_ACCOUNT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/payout-account.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(UpdatePayoutAccountCommand)
export class UpdatePayoutAccountHandler implements ICommandHandler<UpdatePayoutAccountCommand> {
  constructor(
    @Inject(PAYOUT_ACCOUNT_REPOSITORY)
    private readonly payoutAccountRepository: IPayoutAccountRepository,
  ) {}

  async execute(command: UpdatePayoutAccountCommand) {
    const { id, isPrimary, ...rest } = command.data;

    const existing = await this.payoutAccountRepository.findById(id);
    if (!existing) {
      throw new AppException(ErrorCode.PAYOUT_ACCOUNT_NOT_FOUND, 404);
    }

    // If setting as primary, unset other primary accounts
    if (isPrimary) {
      const allAccounts = await this.payoutAccountRepository.findByInstructorProfileId(
        existing.instructorProfileId,
      );
      for (const acc of allAccounts) {
        if (acc.isPrimary && acc.id !== id) {
          await this.payoutAccountRepository.update(acc.id, { isPrimary: false });
        }
      }
    }

    const updateData: any = {};
    if (rest.accountType !== undefined) updateData.accountType = rest.accountType;
    if (rest.accountHolderName !== undefined) updateData.accountHolderName = rest.accountHolderName;
    if (rest.accountNumber !== undefined) updateData.accountNumber = rest.accountNumber;
    if (rest.bankName !== undefined) updateData.bankName = rest.bankName;
    if (rest.bankBranch !== undefined) updateData.bankBranch = rest.bankBranch;
    if (rest.routingCode !== undefined) updateData.routingCode = rest.routingCode;
    if (rest.paypalEmail !== undefined) updateData.paypalEmail = rest.paypalEmail;
    if (rest.currency !== undefined) updateData.currency = rest.currency;
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;
    if (rest.isActive !== undefined) updateData.isActive = rest.isActive;

    return this.payoutAccountRepository.update(id, updateData);
  }
}
