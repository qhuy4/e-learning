export const REVIEW_REPORT_REPOSITORY = 'REVIEW_REPORT_REPOSITORY';

export interface IReviewReportRepository {
  findAll(options: {
    page: number;
    limit: number;
    status?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;

  findById(id: number): Promise<any | null>;
  resolve(id: number, resolvedBy: number): Promise<any>;
  dismiss(id: number): Promise<any>;
  delete(id: number): Promise<void>;
}
