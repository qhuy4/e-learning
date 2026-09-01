export class GetInstructorProfileQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      keyword?: string;
    },
  ) {}
}
