export class ToggleCouponActiveCommand {
  constructor(
    public readonly data: {
      id: number;
    },
  ) {}
}
