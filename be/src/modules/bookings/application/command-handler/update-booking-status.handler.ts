import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { UpdateBookingStatusCommand } from '@/modules/bookings/application/command/update-booking-status.command';
import { BookingRepository } from '@/modules/bookings/infrastructure/repository/booking.repository';
import { DataSource } from 'typeorm';
import { MeetingRoomStatus } from '@/modules/bookings/domain/enum/meeting-room-status.enum';
import { BookingStatusEnum } from '@/modules/bookings/domain/enum/booking-status.enum';
import { MeetingRoomRepositoryImpl } from '@/modules/meeting-room/infrastructure/repository/meeting-room.repository';

const VALID_TRANSITIONS: Record<number, number[]> = {
  0: [1, 2],
  1: [2, 3],
  2: [],
  3: [],
};

@CommandHandler(UpdateBookingStatusCommand)
export class UpdateBookingStatusHandler implements ICommandHandler<UpdateBookingStatusCommand> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly bookingRepository: BookingRepository,
    private readonly meetingRoomRepository: MeetingRoomRepositoryImpl,
  ) {}

  async execute(command: UpdateBookingStatusCommand) {
    const booking = await this.bookingRepository.findById(command.id);

    if (!booking) {
      throw new AppException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const allowed = VALID_TRANSITIONS[booking.status] ?? [];

    if (!allowed.includes(command.status)) {
      throw new AppException(
        ErrorCode.BOOKING_INVALID_STATUS_TRANSITION,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const updatedBooking = await this.bookingRepository.updateStatus(
        command.id,
        command.status,
        manager,
      );

      if (command.status === BookingStatusEnum.CONFIRMED) {
        await this.meetingRoomRepository.create(
          {
            bookingId: command.id,
            roomId: `booking-${command.id}`,
            status: MeetingRoomStatus.WAITING,
          },
          manager,
        );
      }

      return updatedBooking;
    });
  }
}