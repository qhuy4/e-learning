/** Relation review được mapper nạp (kèm user viết review & khóa học). */
export interface ReviewReportReviewRef {
  id: number;
  rating: number;
  comment: string | null;
  status: number;
  user?: { id: number; name: string };
  course?: { id: number; title: string };
}

/** User được mapper nạp (`reporter`/`resolver`). */
export interface ReviewReportUserRef {
  id: number;
  name: string;
}

export class ReviewReport {
  private constructor(
    public readonly id: number,
    public readonly reviewId: number,
    public readonly reportedBy: number,
    public readonly reason: string,
    public readonly status: number,
    public readonly resolvedBy: number | null,
    public readonly resolvedAt: Date | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public readonly review?: ReviewReportReviewRef,
    public readonly reporter?: ReviewReportUserRef,
    public readonly resolver?: ReviewReportUserRef,
  ) {}

  static restore(params: {
    id: number;
    reviewId: number;
    reportedBy: number;
    reason: string;
    status: number;
    resolvedBy: number | null;
    resolvedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    review?: ReviewReportReviewRef;
    reporter?: ReviewReportUserRef;
    resolver?: ReviewReportUserRef;
  }): ReviewReport {
    return new ReviewReport(
      params.id,
      params.reviewId,
      params.reportedBy,
      params.reason,
      params.status,
      params.resolvedBy,
      params.resolvedAt,
      params.createdAt,
      params.updatedAt,
      params.review,
      params.reporter,
      params.resolver,
    );
  }
}
