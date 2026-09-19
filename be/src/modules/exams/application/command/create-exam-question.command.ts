export class CreateExamQuestionCommand {
  constructor(
    public readonly dto: {
      sectionId: number;
      materialId?: number;
      questionTypeId: number;
      question: string;
      explanation?: string;
      points?: number;
      position: number;
      options?: Array<{
        content: string;
        isCorrect?: boolean;
        position: number;
      }>;
    },
    public readonly createdBy?: string,
  ) {}
}
