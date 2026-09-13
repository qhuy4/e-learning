export class DeleteQuestionCommand {
  constructor(
    public readonly data: {
      id: number;
    },
  ) {}
}
