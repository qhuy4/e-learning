export class DeletePayoutAccountCommand {
  constructor(
    public readonly data: {
      id: number;
    },
  ) {}
}
