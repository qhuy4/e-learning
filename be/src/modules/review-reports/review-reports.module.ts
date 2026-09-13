import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { ReviewReportOrmEntity } from '@/modules/review-reports/infrastructure/entity/review-report.orm-entity';
import { ReviewReportRepository } from '@/modules/review-reports/infrastructure/repository/review-report.repository';
import { REVIEW_REPORT_REPOSITORY } from '@/modules/review-reports/domain/repository/review-report.repository';

import { GetAdminReviewReportsHandler } from '@/modules/review-reports/application/query-handler/get-admin-review-reports.handler';
import { GetAdminReviewReportDetailHandler } from '@/modules/review-reports/application/query-handler/get-admin-review-report-detail.handler';
import { ResolveReviewReportHandler } from '@/modules/review-reports/application/command-handler/resolve-review-report.handler';
import { DismissReviewReportHandler } from '@/modules/review-reports/application/command-handler/dismiss-review-report.handler';
import { DeleteReviewReportHandler } from '@/modules/review-reports/application/command-handler/delete-review-report.handler';

import { AdminReviewReportsController } from '@/modules/review-reports/presentation/admin-review-reports.controller';

const QueryHandlers = [GetAdminReviewReportsHandler, GetAdminReviewReportDetailHandler];
const CommandHandlers = [ResolveReviewReportHandler, DismissReviewReportHandler, DeleteReviewReportHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ReviewReportOrmEntity]),
  ],
  controllers: [AdminReviewReportsController],
  providers: [
    ReviewReportRepository,
    {
      provide: REVIEW_REPORT_REPOSITORY,
      useExisting: ReviewReportRepository,
    },
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [REVIEW_REPORT_REPOSITORY],
})
export class ReviewReportsModule {}
