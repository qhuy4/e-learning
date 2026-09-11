export class UpdateQuestionStatusCommand {
  constructor(
    public readonly data: {
      id: number;
      status: number;
    },
  ) {}
}
