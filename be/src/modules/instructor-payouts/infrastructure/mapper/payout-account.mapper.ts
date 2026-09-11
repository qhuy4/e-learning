import { PayoutAccountOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/payout-account.orm-entity';
import { PayoutAccount } from '@/modules/instructor-payouts/domain/entity/payout-account.entity';

export class PayoutAccountMapper {
  static toDomain(entity: PayoutAccountOrmEntity): PayoutAccount {
    return PayoutAccount.restore({
      id: Number(entity.id),
      instructorProfileId: Number(entity.instructorProfileId),
      accountType: entity.accountType,
      accountHolderName: entity.accountHolderName,
      accountNumber: entity.accountNumber,
      bankName: entity.bankName,
      bankBranch: entity.bankBranch,
      routingCode: entity.routingCode,
      paypalEmail: entity.paypalEmail,
      externalRef: entity.externalRef,
      currency: entity.currency,
      isPrimary: entity.isPrimary,
      isVerified: entity.isVerified,
      verifiedAt: entity.verifiedAt,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
