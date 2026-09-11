export class DeleteAnswerCommand {
  constructor(
    public readonly data: {
      id: number;
    },
  ) {}
}
