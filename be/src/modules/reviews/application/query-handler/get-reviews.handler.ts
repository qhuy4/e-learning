import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReviewsQuery } from '@/modules/reviews/application/query/get-reviews.query';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';

@QueryHandler(GetReviewsQuery)
export class GetReviewsHandler implements IQueryHandler<GetReviewsQuery> {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(query: GetReviewsQuery) {
    const { page, limit, keyword, courseId, userId, status, sortBy, sortOrder } = query.data;
    return this.reviewRepository.findAll({
      page,
      limit,
      keyword,
      courseId,
      userId,
      status,
      sortBy,
      sortOrder,
    });
  }
}
