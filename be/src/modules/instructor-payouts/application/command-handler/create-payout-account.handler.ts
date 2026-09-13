import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePayoutAccountCommand } from '@/modules/instructor-payouts/application/command/create-payout-account.command';
import {
  IPayoutAccountRepository,
  PAYOUT_ACCOUNT_REPOSITORY,
} from '@/modules/instructor-payouts/domain/repository/payout-account.repository';

@CommandHandler(CreatePayoutAccountCommand)
export class CreatePayoutAccountHandler implements ICommandHandler<CreatePayoutAccountCommand> {
  constructor(
    @Inject(PAYOUT_ACCOUNT_REPOSITORY)
    private readonly payoutAccountRepository: IPayoutAccountRepository,
  ) {}

  async execute(command: CreatePayoutAccountCommand) {
    const { isPrimary, ...rest } = command.data;

    // If setting as primary, unset other primary accounts
    if (isPrimary) {
      const existing = await this.payoutAccountRepository.findByInstructorProfileId(
        command.data.instructorProfileId,
      );
      for (const acc of existing) {
        if (acc.isPrimary) {
          await this.payoutAccountRepository.update(acc.id, { isPrimary: false });
        }
      }
    }

    return this.payoutAccountRepository.create({
      instructorProfileId: command.data.instructorProfileId.toString(),
      accountType: rest.accountType,
      accountHolderName: rest.accountHolderName,
      accountNumber: rest.accountNumber ?? null,
      bankName: rest.bankName ?? null,
      bankBranch: rest.bankBranch ?? null,
      routingCode: rest.routingCode ?? null,
      paypalEmail: rest.paypalEmail ?? null,
      currency: rest.currency ?? 'VND',
      isPrimary: isPrimary ?? false,
      isVerified: false,
      isActive: true,
    });
  }
}
