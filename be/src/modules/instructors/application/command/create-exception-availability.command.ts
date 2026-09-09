export class CreateExceptionAvailabilityCommand {
  constructor(
    public readonly instructorId: number,
    public readonly data: {
      specific_date: string;
      is_unavailable: boolean;
      start_time?: string | null;
      end_time?: string | null;
      reason?: string | null;
    },
  ) {}
}
