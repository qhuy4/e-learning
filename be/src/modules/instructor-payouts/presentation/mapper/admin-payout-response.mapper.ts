import { InstructorPayout } from '@/modules/instructor-payouts/domain/entity/instructor-payout.entity';

export class AdminPayoutResponseMapper {
  static toResponse(payout: InstructorPayout) {
    return {
      id: payout.id,
      periodStart: payout.periodStart,
      periodEnd: payout.periodEnd,
      totalGross: payout.totalGross,
      totalPlatformFee: payout.totalPlatformFee,
      totalInstructorAmount: payout.totalInstructorAmount,
      currency: payout.currency,
      status: payout.status,
      paymentMethod: payout.paymentMethod,
      transactionRef: payout.transactionRef,
      note: payout.note,
      paidAt: payout.paidAt,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt,
      instructor: payout.instructor,
      payoutAccount: payout.payoutAccount,
    };
  }
}
