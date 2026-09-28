import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { CreateBookingCommand } from '@/modules/bookings/application/command/create-booking.command';
import { BookingRepository } from '@/modules/bookings/infrastructure/repository/booking.repository';
import { AvailabilityRepository } from '@/modules/bookings/infrastructure/repository/availability.repository';

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly availabilityRepository: AvailabilityRepository,
  ) {}

  async execute(command: CreateBookingCommand) {
    const { startTime, endTime } = command;
    const startMin = toMin(startTime);
    const endMin = toMin(endTime);

    if (
      !Number.isFinite(startMin) ||
      !Number.isFinite(endMin) ||
      endMin <= startMin
    ) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }

    const window = await this.availabilityRepository.findInstructorWindow(
      command.instructorId,
      command.bookingDate,
    );

    if (
      !window.available ||
      !window.start ||
      !window.end ||
      startMin < toMin(window.start) ||
      endMin > toMin(window.end)
    ) {
      throw new AppException(ErrorCode.AVAILABILITY_CONFLICT, HttpStatus.CONFLICT);
    }

    const blocked = window.busy.some((b) =>
      overlaps(startMin, endMin, toMin(b.start), toMin(b.end)),
    );
    if (blocked) {
      throw new AppException(ErrorCode.AVAILABILITY_CONFLICT, HttpStatus.CONFLICT);
    }

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
