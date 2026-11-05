import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { UpdateReviewStatusCommand } from '@/modules/reviews/application/command/update-review-status.command';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';
import { SkillAssessmentRunService } from '@/modules/skill-profiling/application/skill-assessment-run.service';

@CommandHandler(UpdateReviewStatusCommand)
export class UpdateReviewStatusHandler implements ICommandHandler<UpdateReviewStatusCommand> {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly assessmentRuns: SkillAssessmentRunService,
  ) {}

  async execute(command: UpdateReviewStatusCommand) {
    const { id, status } = command.data;
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new AppException(ErrorCode.REVIEW_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const updated = await this.reviewRepository.updateStatus(id, status);
    await this.assessmentRuns.onEvidenceChangedForCourse(review.courseId);
    return updated;
  }
}
