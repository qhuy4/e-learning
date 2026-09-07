export class UpdateExceptionAvailabilityCommand {
  constructor(
    public readonly id: number,
    public readonly instructorId: number,
    public readonly data: {
      specific_date?: string;
      is_unavailable?: boolean;
      start_time?: string | null;
      end_time?: string | null;
      reason?: string | null;
    },
  ) {}
}
