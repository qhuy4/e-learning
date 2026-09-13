export class UpdateAnswerStatusCommand {
  constructor(
    public readonly data: {
      id: number;
      status: number;
    },
  ) {}
}
