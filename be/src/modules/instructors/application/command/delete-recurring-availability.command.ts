export class DeleteRecurringAvailabilityCommand {
  constructor(
    public readonly id: number,
    public readonly instructorId: number,
  ) {}
}
