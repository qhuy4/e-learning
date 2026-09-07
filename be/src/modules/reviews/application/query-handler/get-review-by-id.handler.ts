import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetReviewByIdQuery } from '@/modules/reviews/application/query/get-review-by-id.query';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';

@QueryHandler(GetReviewByIdQuery)
export class GetReviewByIdHandler implements IQueryHandler<GetReviewByIdQuery> {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(query: GetReviewByIdQuery) {
    const review = await this.reviewRepository.findById(query.data.id);
    if (!review) {
      throw new NotFoundException(`Review with ID ${query.data.id} not found`);
    }
    return review;
  }
}
