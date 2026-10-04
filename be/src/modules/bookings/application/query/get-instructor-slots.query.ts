export class GetInstructorSlotsQuery {
  constructor(
    public readonly data: {
      instructorId: number;
      bookingDate: string;
      /** "HH:MM" start times */
      slots: string[];
      /** minutes per slot */
      durationMinutes: number;
    },
  ) {}
}
