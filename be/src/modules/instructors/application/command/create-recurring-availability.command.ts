export class CreateRecurringAvailabilityCommand {
  constructor(
    public readonly instructorId: number,
    public readonly data: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      effective_from: string;
      effective_until?: string | null;
      is_active?: boolean;
    },
  ) {}
}
