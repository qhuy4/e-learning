import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteReviewCommand } from '@/modules/reviews/application/command/delete-review.command';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';

@CommandHandler(DeleteReviewCommand)
export class DeleteReviewHandler implements ICommandHandler<DeleteReviewCommand> {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(command: DeleteReviewCommand) {
    const { id, userId } = command;

    const deleted = await this.reviewRepository.deleteReview(id, userId);
    if (!deleted) {
      throw new NotFoundException('Đánh giá không tồn tại hoặc bạn không có quyền xóa');
    }

    return { success: true };
  }
}
