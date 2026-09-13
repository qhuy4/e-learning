export class CreateEnrollmentCommand {
  constructor(
    public readonly data: {
      userId: number;
      courseId: number;
      pricePaid: number;
      currency: string;
    },
  ) {}
}
