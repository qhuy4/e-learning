import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCourseReviewsQuery } from '@/modules/reviews/application/query/get-course-reviews.query';
import { ReviewRepository } from '@/modules/reviews/infrastructure/repository/review.repository';
import { ReviewDtoMapper } from '@/modules/reviews/presentation/mappers/review-dto.mapper';

@QueryHandler(GetCourseReviewsQuery)
export class GetCourseReviewsHandler implements IQueryHandler<GetCourseReviewsQuery> {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(query: GetCourseReviewsQuery) {
    const { courseId, page, limit, rating, sortOrder, hasImage } = query;

    const result = await this.reviewRepository.findByCourseIdWithStats({
      courseId,
      page,
      limit,
      rating,
      sortOrder,
      hasImage,
    });

    return {
      ...result,
      data: ReviewDtoMapper.toDtoList(result.data),
    };
  }
}
