import { PayoutAccount } from '@/modules/instructor-payouts/domain/entity/payout-account.entity';

export class AdminPayoutAccountResponseMapper {
  static toResponse(account: PayoutAccount) {
    return {
      id: account.id,
      instructorProfileId: account.instructorProfileId,
      accountType: account.accountType,
      accountHolderName: account.accountHolderName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      bankBranch: account.bankBranch,
      routingCode: account.routingCode,
      paypalEmail: account.paypalEmail,
      currency: account.currency,
      isPrimary: account.isPrimary,
      isVerified: account.isVerified,
      verifiedAt: account.verifiedAt,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
