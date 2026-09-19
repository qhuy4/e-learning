export class CreateExamFormatCommand {
  constructor(
    public readonly dto: {
      examTypeId: number;
      code: string;
      name: string;
      version?: string;
      description?: string;
      durationSeconds?: number;
      isActive?: boolean;
      effectiveFrom?: string;
      effectiveTo?: string;
      sections?: Array<{
        code: string;
        name: string;
        description?: string;
        instructions?: string;
        position: number;
        durationSeconds?: number;
        questionCount?: number;
      }>;
    },
    public readonly createdBy?: string,
  ) {}
}
