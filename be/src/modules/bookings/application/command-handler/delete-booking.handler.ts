import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { DeleteBookingCommand } from '@/modules/bookings/application/command/delete-booking.command';
import { BookingRepository } from '@/modules/bookings/infrastructure/repository/booking.repository';

@CommandHandler(DeleteBookingCommand)
export class DeleteBookingHandler implements ICommandHandler<DeleteBookingCommand> {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(command: DeleteBookingCommand) {
    const booking = await this.bookingRepository.findById(command.id);
    if (!booking) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.bookingRepository.delete(command.id);
  }
}
