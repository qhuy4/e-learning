import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateReviewCommand } from '@/modules/reviews/application/command/create-review.command';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';
import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from '@/modules/enrollments/domain/repository/enrollment.repository';

@CommandHandler(CreateReviewCommand)
export class CreateReviewHandler implements ICommandHandler<CreateReviewCommand> {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(command: CreateReviewCommand) {
    const { userId, courseId, rating, comment, imageUrls } = command;

    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestException('Số sao đánh giá phải từ 1 đến 5');
    }

    // 1. Enforce requirement: User MUST be enrolled in the course to leave a review
    const isEnrolled = await this.enrollmentRepository.existsActiveByUserAndCourse(
      Number(userId),
      Number(courseId),
    );

    if (!isEnrolled) {
      throw new ForbiddenException(
        'Bạn cần mua hoặc đăng ký khóa học này để có thể gửi đánh giá.',
      );
    }

    // 2. Save or update review with review images
    return this.reviewRepository.createOrUpdateReview({
      userId,
      courseId,
      rating,
      comment,
      imageUrls,
    });
  }
}
