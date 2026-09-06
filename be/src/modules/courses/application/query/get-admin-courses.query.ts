export class GetAdminCoursesQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly level?: number,
    public readonly keyword?: string,
    public readonly status?: number,
  ) {}
}
