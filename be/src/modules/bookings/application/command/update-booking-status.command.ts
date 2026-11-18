import { BookingStatusEnum } from '@/modules/bookings/domain/enum/booking-status.enum';

export class UpdateBookingStatusCommand {
  constructor(
    public readonly id: number,
    public readonly status: BookingStatusEnum,
  ) {}
}
