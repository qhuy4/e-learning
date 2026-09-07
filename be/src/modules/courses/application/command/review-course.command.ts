export class ReviewCourseCommand {
  constructor(
    public readonly data: {
      id: string;
      status: number;
      rejectReason?: string;
    },
  ) {}
}
