export class UpdateExamFormatCommand {
  constructor(
    public readonly id: number,
    public readonly dto: {
      code?: string;
      name?: string;
      version?: string;
      description?: string;
      durationSeconds?: number;
      isActive?: boolean;
      effectiveFrom?: string;
      effectiveTo?: string;
    },
    public readonly createdBy?: string,
  ) {}
}
