export class GetAvailableTeachersQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      bookingDate: string | undefined;
      startTime: string | undefined;
      endTime: string | undefined;
      keyword: string | undefined;
    },
  ) {}
}
