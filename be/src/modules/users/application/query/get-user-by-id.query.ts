export class GetUserByIdQuery {
  constructor(
    public readonly data: {
      id: number;
    },
  ) {}
}
