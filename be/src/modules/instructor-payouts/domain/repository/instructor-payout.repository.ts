export const INSTRUCTOR_PAYOUT_REPOSITORY = 'INSTRUCTOR_PAYOUT_REPOSITORY';

export interface IInstructorPayoutRepository {
  findAll(options: {
    page: number;
    limit: number;
    instructorId?: number;
    status?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;

  findById(id: number): Promise<any | null>;

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
  }): Promise<any>;

  updateStatus(id: number, data: {
    status: number;
    transactionRef?: string;
    paidAt?: Date;
    note?: string;
  }): Promise<any>;

  findPayoutSplits(payoutId: number): Promise<any[]>;
}
