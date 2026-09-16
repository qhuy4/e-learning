export class UpdateAchievementCommand {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly icon: string | null,
    public readonly criteria: string,
    public readonly threshold: number,
    public readonly reward: unknown,
    public readonly isActive: boolean,
  ) {}
}
