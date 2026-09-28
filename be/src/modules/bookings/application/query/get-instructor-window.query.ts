export class GetInstructorWindowQuery {
  constructor(
    public readonly data: {
      instructorId: number;
      bookingDate: string;
    },
  ) {}
}
