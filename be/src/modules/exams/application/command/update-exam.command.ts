export class UpdateExamCommand {
  constructor(
    public readonly id: number,
    public readonly dto: {
      title?: string;
      description?: string;
      isPremium?: boolean;
      durationSeconds?: number;
    },
    public readonly createdBy?: string,
  ) {}
}
