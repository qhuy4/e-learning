export class GetBookingsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly keyword?: string,
    public readonly instructorId?: number,
    public readonly studentId?: number,
    public readonly status?: number,
    public readonly bookingDate?: string,
  ) {}
}
