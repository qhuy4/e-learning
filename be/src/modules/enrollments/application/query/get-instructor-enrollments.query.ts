export class GetInstructorEnrollmentsQuery {
  constructor(
    public readonly data: {
      instructorId: number;
      page: number;
      limit: number;
      keyword?: string;
      status?: number;
      courseId?: number;
    },
  ) {}
}
