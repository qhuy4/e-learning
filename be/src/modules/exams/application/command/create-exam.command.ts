export class CreateExamCommand {
  constructor(
    public readonly dto: {
      examFormatId: number;
      title: string;
      description?: string;
      isPremium?: boolean;
      durationSeconds?: number;
      createdBy: number;
    },
    public readonly createdBy?: string,
  ) {}
}
