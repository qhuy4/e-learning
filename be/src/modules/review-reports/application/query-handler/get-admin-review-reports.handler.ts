import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminReviewReportsQuery } from '@/modules/review-reports/application/query/get-admin-review-reports.query';
import {
  IReviewReportRepository,
  REVIEW_REPORT_REPOSITORY,
} from '@/modules/review-reports/domain/repository/review-report.repository';

@QueryHandler(GetAdminReviewReportsQuery)
export class GetAdminReviewReportsHandler implements IQueryHandler<GetAdminReviewReportsQuery> {
  constructor(
    @Inject(REVIEW_REPORT_REPOSITORY)
    private readonly reportRepository: IReviewReportRepository,
  ) {}

  async execute(query: GetAdminReviewReportsQuery) {
    return this.reportRepository.findAll(query.data);
  }
}
