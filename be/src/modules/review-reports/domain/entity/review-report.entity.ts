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
    public readonly review?: any,
    public readonly reporter?: any,
    public readonly resolver?: any,
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
    review?: any;
    reporter?: any;
    resolver?: any;
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
