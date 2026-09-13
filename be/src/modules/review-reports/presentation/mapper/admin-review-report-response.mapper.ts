import { ReviewReport } from '@/modules/review-reports/domain/entity/review-report.entity';

export class AdminReviewReportResponseMapper {
  static toResponse(report: ReviewReport) {
    return {
      id: report.id,
      reason: report.reason,
      status: report.status,
      resolvedAt: report.resolvedAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      review: report.review,
      reporter: report.reporter,
      resolver: report.resolver,
    };
  }
}
