export class SubmitExamAttemptCommand {
  constructor(
    public readonly dto: {
      attemptId: number;
      answers: Array<{
        questionId: number;
        selectedOptionId?: number;
        answerText?: string;
      }>;
    },
    public readonly createdBy?: string,
  ) {}
}
