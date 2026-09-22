import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { UpdateBookingStatusCommand } from '@/modules/bookings/application/command/update-booking-status.command';
import { BookingRepository } from '@/modules/bookings/infrastructure/repository/booking.repository';

const VALID_TRANSITIONS: Record<number, number[]> = {
  0: [1, 2],
  1: [2, 3],
  2: [],
  3: [],
};

@CommandHandler(UpdateBookingStatusCommand)
export class UpdateBookingStatusHandler implements ICommandHandler<UpdateBookingStatusCommand> {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(command: UpdateBookingStatusCommand) {
    const booking = await this.bookingRepository.findById(command.id);
    if (!booking) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const allowed = VALID_TRANSITIONS[booking.status] ?? [];
    if (!allowed.includes(command.status)) {
      throw new AppException(ErrorCode.BOOKING_INVALID_STATUS_TRANSITION, HttpStatus.BAD_REQUEST);
    }

    return this.bookingRepository.updateStatus(command.id, command.status);
  }
}
