export class UpdateOrderStatusCommand {
  constructor(
    public readonly data: {
      id: number;
      status: string;
    },
  ) {}
}
