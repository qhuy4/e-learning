export class GetAchievementsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly keyword?: string,
    public readonly sortBy?: string,
    public readonly sortOrder?: string,
  ) {}
}
