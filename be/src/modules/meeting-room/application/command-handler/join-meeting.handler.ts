import { JoinMeetingRoomCommand } from '@/modules/meeting-room/application/command/join-meeting.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatusEnum } from '@/modules/bookings/domain/enum/booking-status.enum';
import { BookingOrmEntity } from '@/modules/bookings/infrastructure/entity/booking.orm-entity';
import { MeetingRoomRepositoryImpl } from '@/modules/meeting-room/infrastructure/repository/meeting-room.repository';
import { LiveKitService } from '@/modules/meeting-room/infrastructure/livekit/service/livekit.service';

@CommandHandler(JoinMeetingRoomCommand)
export class JoinMeetingRoomHandler implements ICommandHandler<JoinMeetingRoomCommand> {
  constructor(
    private readonly meetingRoomRepository: MeetingRoomRepositoryImpl,
    private readonly liveKitService: LiveKitService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: JoinMeetingRoomCommand) {
    const { meetingRoomId, userId } = command;

    const meetingRoom =
      await this.meetingRoomRepository.findByIdWithBooking(meetingRoomId);

    if (!meetingRoom) {
      throw new NotFoundException('Meeting room not found');
    }

    const booking = meetingRoom.booking;

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatusEnum.CONFIRMED) {
      throw new BadRequestException('Booking is not confirmed');
    }

    const isParticipant =
      booking.student_id === userId || booking.instructor_id === userId;

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this booking');
    }

    await this.validateJoinWindow(booking, meetingRoom.id);

    const participantName =
      booking.student_id === userId
        ? booking.student?.name
        : booking.instructor?.name;

    const token = await this.liveKitService.createToken({
      roomName: meetingRoom.roomId,
      identity: `user-${userId}`,
      name: participantName || `User ${userId}`,
    });

    await this.meetingRoomRepository.markActive(meetingRoom.id);

    const endAt = new Date(`${booking.booking_date}T${booking.end_time}`);

    return {
      token,
      roomName: meetingRoom.roomId,
      serverUrl: this.configService.getOrThrow<string>('LIVEKIT_URL'),
      endsAt: endAt.toISOString(),
    };
  }

  private async validateJoinWindow(
    booking: BookingOrmEntity,
    meetingRoomId: number,
  ) {
    const now = new Date();

    const startAt = new Date(`${booking.booking_date}T${booking.start_time}`);

    const endAt = new Date(`${booking.booking_date}T${booking.end_time}`);

    const joinFrom = new Date(startAt.getTime() - 10 * 60 * 1000);
    if (now < joinFrom) {
      throw new BadRequestException('Meeting room is not available yet');
    }

    if (now >= endAt) {
      await this.meetingRoomRepository.markEnded(meetingRoomId);
      throw new BadRequestException('Meeting has ended');
    }
  }
}
