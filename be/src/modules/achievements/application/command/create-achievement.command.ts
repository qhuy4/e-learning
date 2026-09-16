export class CreateAchievementCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly icon: string | null,
    public readonly criteria: string,
    public readonly threshold: number,
    public readonly reward: unknown,
  ) {}
}
