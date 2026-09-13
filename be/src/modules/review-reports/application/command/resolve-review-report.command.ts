export class ResolveReviewReportCommand {
  constructor(
    public readonly data: {
      id: number;
      resolvedBy: number;
    },
  ) {}
}
