import { ReviewReportOrmEntity } from '@/modules/review-reports/infrastructure/entity/review-report.orm-entity';
import { ReviewReport } from '@/modules/review-reports/domain/entity/review-report.entity';

export class ReviewReportMapper {
  static toDomain(entity: ReviewReportOrmEntity): ReviewReport {
    return ReviewReport.restore({
      id: Number(entity.id),
      reviewId: Number(entity.reviewId),
      reportedBy: Number(entity.reportedBy),
      reason: entity.reason,
      status: entity.status,
      resolvedBy: entity.resolvedBy ? Number(entity.resolvedBy) : null,
      resolvedAt: entity.resolvedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      review: entity.review
        ? {
            id: Number(entity.review.id),
            rating: entity.review.rating,
            comment: entity.review.comment,
            status: entity.review.status,
            user: entity.review.user
              ? { id: Number(entity.review.user.id), name: entity.review.user.name }
              : undefined,
            course: entity.review.course
              ? { id: Number(entity.review.course.id), title: entity.review.course.title }
              : undefined,
          }
        : undefined,
      reporter: entity.reporter
        ? { id: Number(entity.reporter.id), name: entity.reporter.name }
        : undefined,
      resolver: entity.resolver
        ? { id: Number(entity.resolver.id), name: entity.resolver.name }
        : undefined,
    });
  }
}
