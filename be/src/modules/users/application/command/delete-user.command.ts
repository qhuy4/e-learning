export class DeleteUserCommand {
  constructor(
    public readonly data: {
      id: number;
    },
  ) {}
}
