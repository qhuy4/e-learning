export class AwardAchievementCommand {
  constructor(
    public readonly userId: number,
    public readonly achievementId: number,
  ) {}
}
