export class UpdateExamQuestionCommand {
  constructor(
    public readonly id: number,
    public readonly dto: {
      materialId?: number;
      questionTypeId?: number;
      question?: string;
      explanation?: string;
      points?: number;
      position?: number;
    },
    public readonly createdBy?: string,
  ) {}
}
