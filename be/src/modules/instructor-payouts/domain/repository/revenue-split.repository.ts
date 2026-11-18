import { RevenueSplit } from '@/modules/instructor-payouts/domain/entity/revenue-split.entity';

export const REVENUE_SPLIT_REPOSITORY = 'REVENUE_SPLIT_REPOSITORY';

export interface AdminRevenueSplitsPage {
  data: RevenueSplit[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface RevenueSummary {
  totalGross: number;
  totalPlatformFee: number;
  totalInstructorAmount: number;
  totalSplits: number;
  pendingCount: number;
  paidCount: number;
}

export interface IRevenueSplitRepository {
  findAll(options: {
    page: number;
    limit: number;
    instructorId?: number;
    courseId?: number;
    payoutStatus?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AdminRevenueSplitsPage>;

  getSummary(options: {
    instructorId?: number;
    payoutStatus?: string;
  }): Promise<RevenueSummary>;

  findById(id: number): Promise<RevenueSplit | null>;
}
