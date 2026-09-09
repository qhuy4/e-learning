export class CheckEnrollmentQuery {
  constructor(
    public readonly data: {
      userId: number;
      courseId: number;
    },
  ) {}
}
