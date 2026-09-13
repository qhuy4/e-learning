import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteReviewReportCommand } from '@/modules/review-reports/application/command/delete-review-report.command';
import {
  IReviewReportRepository,
  REVIEW_REPORT_REPOSITORY,
} from '@/modules/review-reports/domain/repository/review-report.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(DeleteReviewReportCommand)
export class DeleteReviewReportHandler implements ICommandHandler<DeleteReviewReportCommand> {
  constructor(
    @Inject(REVIEW_REPORT_REPOSITORY)
    private readonly reportRepository: IReviewReportRepository,
  ) {}

  async execute(command: DeleteReviewReportCommand) {
    const existing = await this.reportRepository.findById(command.data.id);
    if (!existing) {
      throw new AppException(ErrorCode.REVIEW_REPORT_NOT_FOUND, 404);
    }
    await this.reportRepository.delete(command.data.id);
  }
}
