import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateReviewStatusCommand } from '@/modules/reviews/application/command/update-review-status.command';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';

@CommandHandler(UpdateReviewStatusCommand)
export class UpdateReviewStatusHandler implements ICommandHandler<UpdateReviewStatusCommand> {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(command: UpdateReviewStatusCommand) {
    const { id, status } = command.data;
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return this.reviewRepository.updateStatus(id, status);
  }
}
