export class UpdateReviewStatusCommand {
  constructor(
    public readonly data: {
      id: string;
      status: number;
    },
  ) {}
}
