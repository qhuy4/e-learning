export const REVENUE_SPLIT_REPOSITORY = 'REVENUE_SPLIT_REPOSITORY';

export interface IRevenueSplitRepository {
  findAll(options: {
    page: number;
    limit: number;
    instructorId?: number;
    courseId?: number;
    payoutStatus?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;

  getSummary(options: {
    instructorId?: number;
    payoutStatus?: string;
  }): Promise<{
    totalGross: number;
    totalPlatformFee: number;
    totalInstructorAmount: number;
    totalSplits: number;
    pendingCount: number;
    paidCount: number;
  }>;

  findById(id: number): Promise<any | null>;
}
