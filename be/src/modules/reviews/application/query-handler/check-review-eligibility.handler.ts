import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CheckReviewEligibilityQuery } from '@/modules/reviews/application/query/check-review-eligibility.query';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';
import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from '@/modules/enrollments/domain/repository/enrollment.repository';
import { ReviewDtoMapper } from '@/modules/reviews/presentation/mappers/review-dto.mapper';

@QueryHandler(CheckReviewEligibilityQuery)
export class CheckReviewEligibilityHandler
  implements IQueryHandler<CheckReviewEligibilityQuery>
{
  constructor(
    private readonly reviewRepository: ReviewRepository,
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(query: CheckReviewEligibilityQuery) {
    const { userId, courseId } = query;

    const targetCourseId = await this.reviewRepository.resolveCourseId(courseId);

    const isEnrolled = await this.enrollmentRepository.existsActiveByUserAndCourse(
      Number(userId),
      Number(targetCourseId),
    );

    const userReview = await this.reviewRepository.findByUserAndCourse(
      userId,
      targetCourseId,
    );

    return {
      isEnrolled,
      canReview: isEnrolled,
      hasReviewed: !!userReview,
      userReview: userReview ? ReviewDtoMapper.toDto(userReview) : null,
    };
  }
}
