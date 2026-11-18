import { PayoutStatus } from '@/modules/instructor-payouts/domain/enum/payout-status.enum';
import { PaymentMethod } from '@/modules/instructor-payouts/domain/enum/payment-method.enum';

/** User được mapper nạp (relation `instructor`). */
export interface PayoutInstructorRef {
  id: number;
  name: string;
}

/** Payout account được mapper nạp (relation `payoutAccount`). */
export interface PayoutAccountRef {
  id: number;
  accountHolderName: string;
  bankName: string | null;
  accountNumber: string | null;
  paypalEmail: string | null;
}

export class InstructorPayout {
  private constructor(
    public readonly id: number,
    public readonly instructorId: number,
    public readonly payoutAccountId: number,
    public readonly periodStart: string,
    public readonly periodEnd: string,
    public readonly totalGross: number,
    public readonly totalPlatformFee: number,
    public readonly totalInstructorAmount: number,
    public readonly currency: string,
    public readonly status: PayoutStatus,
    public readonly paymentMethod: PaymentMethod,
    public readonly transactionRef: string | null,
    public readonly note: string | null,
    public readonly paidAt: Date | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public readonly instructor?: PayoutInstructorRef,
    public readonly payoutAccount?: PayoutAccountRef,
  ) {}

  static restore(params: {
    id: number;
    instructorId: number;
    payoutAccountId: number;
    periodStart: string;
    periodEnd: string;
    totalGross: number;
    totalPlatformFee: number;
    totalInstructorAmount: number;
    currency: string;
    status: PayoutStatus;
    paymentMethod: PaymentMethod;
    transactionRef: string | null;
    note: string | null;
    paidAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    instructor?: PayoutInstructorRef;
    payoutAccount?: PayoutAccountRef;
  }): InstructorPayout {
    return new InstructorPayout(
      params.id,
      params.instructorId,
      params.payoutAccountId,
      params.periodStart,
      params.periodEnd,
      params.totalGross,
      params.totalPlatformFee,
      params.totalInstructorAmount,
      params.currency,
      params.status,
      params.paymentMethod,
      params.transactionRef,
      params.note,
      params.paidAt,
      params.createdAt,
      params.updatedAt,
      params.instructor,
      params.payoutAccount,
    );
  }
}
