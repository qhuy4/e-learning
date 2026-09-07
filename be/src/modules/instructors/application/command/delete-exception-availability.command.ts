export class DeleteExceptionAvailabilityCommand {
  constructor(
    public readonly id: number,
    public readonly instructorId: number,
  ) {}
}
