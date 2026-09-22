export class CreateBookingCommand {
  constructor(
    public readonly studentId: number,
    public readonly instructorId: number,
    public readonly bookingDate: string,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly notes?: string,
  ) {}
}
