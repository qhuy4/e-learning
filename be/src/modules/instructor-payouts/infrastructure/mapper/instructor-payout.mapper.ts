import { InstructorPayoutOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/instructor-payout.orm-entity';
import { InstructorPayout } from '@/modules/instructor-payouts/domain/entity/instructor-payout.entity';
import { PayoutStatus } from '@/modules/instructor-payouts/domain/enum/payout-status.enum';
import { PaymentMethod } from '@/modules/instructor-payouts/domain/enum/payment-method.enum';

export class InstructorPayoutMapper {
  static toDomain(entity: InstructorPayoutOrmEntity): InstructorPayout {
    return InstructorPayout.restore({
      id: Number(entity.id),
      instructorId: Number(entity.instructorId),
      payoutAccountId: Number(entity.payoutAccountId),
      periodStart: entity.periodStart,
      periodEnd: entity.periodEnd,
      totalGross: Number(entity.totalGross),
      totalPlatformFee: Number(entity.totalPlatformFee),
      totalInstructorAmount: Number(entity.totalInstructorAmount),
      currency: entity.currency,
      status: entity.status as PayoutStatus,
      paymentMethod: entity.paymentMethod as PaymentMethod,
      transactionRef: entity.transactionRef,
      note: entity.note,
      paidAt: entity.paidAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      instructor: entity.instructor
        ? { id: Number(entity.instructor.id), name: entity.instructor.name }
        : undefined,
      payoutAccount: entity.payoutAccount
        ? {
            id: Number(entity.payoutAccount.id),
            accountHolderName: entity.payoutAccount.accountHolderName,
            bankName: entity.payoutAccount.bankName,
            accountNumber: entity.payoutAccount.accountNumber,
            paypalEmail: entity.payoutAccount.paypalEmail,
          }
        : undefined,
    });
  }
}
