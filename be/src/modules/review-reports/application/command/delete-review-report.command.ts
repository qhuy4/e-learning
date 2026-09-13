export class DeleteReviewReportCommand {
  constructor(
    public readonly data: {
      id: number;
    },
  ) {}
}
