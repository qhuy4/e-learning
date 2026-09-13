import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ResolveReviewReportCommand } from '@/modules/review-reports/application/command/resolve-review-report.command';
import {
  IReviewReportRepository,
  REVIEW_REPORT_REPOSITORY,
} from '@/modules/review-reports/domain/repository/review-report.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(ResolveReviewReportCommand)
export class ResolveReviewReportHandler implements ICommandHandler<ResolveReviewReportCommand> {
  constructor(
    @Inject(REVIEW_REPORT_REPOSITORY)
    private readonly reportRepository: IReviewReportRepository,
  ) {}

  async execute(command: ResolveReviewReportCommand) {
    const existing = await this.reportRepository.findById(command.data.id);
    if (!existing) {
      throw new AppException(ErrorCode.REVIEW_REPORT_NOT_FOUND, 404);
    }
    return this.reportRepository.resolve(command.data.id, command.data.resolvedBy);
  }
}
