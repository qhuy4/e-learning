import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { CreateBookingCommand } from '@/modules/bookings/application/command/create-booking.command';
import { BookingRepository } from '@/modules/bookings/infrastructure/repository/booking.repository';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(command: CreateBookingCommand) {
    const overlap = await this.bookingRepository.findOverlap(
      command.instructorId,
      command.bookingDate,
      command.startTime,
      command.endTime,
    );

    if (overlap) {
      throw new AppException(ErrorCode.BOOKING_TIME_CONFLICT, HttpStatus.CONFLICT);
    }

    return this.bookingRepository.create({
      student_id: command.studentId,
      instructor_id: command.instructorId,
      booking_date: command.bookingDate,
      start_time: command.startTime,
      end_time: command.endTime,
      notes: command.notes ?? null,
      status: 1,
    });
  }
}
