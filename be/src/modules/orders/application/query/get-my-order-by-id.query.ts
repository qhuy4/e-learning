export class GetMyOrderByIdQuery {
  constructor(
    public readonly data: {
      userId: number;
      id: number;
    },
  ) {}
}
