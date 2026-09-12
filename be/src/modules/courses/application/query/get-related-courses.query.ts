export class GetRelatedCoursesQuery {
  constructor(
    public readonly slug: string,
    public readonly limit: number = 4,
  ) {}
}
