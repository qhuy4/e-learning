import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { GetReviewByIdQuery } from '@/modules/reviews/application/query/get-review-by-id.query';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';

@QueryHandler(GetReviewByIdQuery)
export class GetReviewByIdHandler implements IQueryHandler<GetReviewByIdQuery> {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(query: GetReviewByIdQuery) {
    const review = await this.reviewRepository.findById(query.data.id);
    if (!review) {
      throw new AppException(ErrorCode.REVIEW_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return review;
  }
}
