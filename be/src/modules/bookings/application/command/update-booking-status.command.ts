export class UpdateBookingStatusCommand {
  constructor(
    public readonly id: number,
    public readonly status: number,
  ) {}
}
