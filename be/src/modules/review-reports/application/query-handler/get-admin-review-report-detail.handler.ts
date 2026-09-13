import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminReviewReportDetailQuery } from '@/modules/review-reports/application/query/get-admin-review-report-detail.query';
import {
  IReviewReportRepository,
  REVIEW_REPORT_REPOSITORY,
} from '@/modules/review-reports/domain/repository/review-report.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@QueryHandler(GetAdminReviewReportDetailQuery)
export class GetAdminReviewReportDetailHandler implements IQueryHandler<GetAdminReviewReportDetailQuery> {
  constructor(
    @Inject(REVIEW_REPORT_REPOSITORY)
    private readonly reportRepository: IReviewReportRepository,
  ) {}

  async execute(query: GetAdminReviewReportDetailQuery) {
    const report = await this.reportRepository.findById(query.data.id);
    if (!report) {
      throw new AppException(ErrorCode.REVIEW_REPORT_NOT_FOUND, 404);
    }
    return report;
  }
}
