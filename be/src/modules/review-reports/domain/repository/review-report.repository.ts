import { ReviewReport } from '@/modules/review-reports/domain/entity/review-report.entity';

export const REVIEW_REPORT_REPOSITORY = 'REVIEW_REPORT_REPOSITORY';

export interface AdminReviewReportsPage {
  data: ReviewReport[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface IReviewReportRepository {
  findAll(options: {
    page: number;
    limit: number;
    status?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AdminReviewReportsPage>;

  findById(id: number): Promise<ReviewReport | null>;
  resolve(id: number, resolvedBy: number): Promise<ReviewReport | null>;
  dismiss(id: number): Promise<ReviewReport | null>;
  delete(id: number): Promise<void>;
}
