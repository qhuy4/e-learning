import { InstructorPayout } from '@/modules/instructor-payouts/domain/entity/instructor-payout.entity';
import { RevenueSplitOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/revenue-split.orm-entity';

export const INSTRUCTOR_PAYOUT_REPOSITORY = 'INSTRUCTOR_PAYOUT_REPOSITORY';

export interface AdminPayoutsPage {
  data: InstructorPayout[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface IInstructorPayoutRepository {
  findAll(options: {
    page: number;
    limit: number;
    instructorId?: number;
    status?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AdminPayoutsPage>;

  findById(id: number): Promise<InstructorPayout | null>;

  create(data: {
    instructorId: number;
    payoutAccountId: number;
    periodStart: string;
    periodEnd: string;
    totalGross: number;
    totalPlatformFee: number;
    totalInstructorAmount: number;
    currency: string;
    status: number;
    paymentMethod: number;
    note?: string;
  }): Promise<InstructorPayout | null>;

  updateStatus(id: number, data: {
    status: number;
    transactionRef?: string;
    paidAt?: Date;
    note?: string;
  }): Promise<InstructorPayout | null>;

  findPayoutSplits(payoutId: number): Promise<RevenueSplitOrmEntity[]>;
}
