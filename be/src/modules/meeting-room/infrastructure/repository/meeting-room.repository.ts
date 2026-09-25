import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoomOrmEntity } from '@/modules/bookings/infrastructure/entity/meeting-room.orm-entity';
import { EntityManager, Repository } from 'typeorm';
import { MeetingRoomRepository } from '@/modules/meeting-room/domain/meeting-room.repository';
import { MeetingRoomStatus } from '@/modules/bookings/domain/enum/meeting-room-status.enum';

export interface CreateMeetingRoomData {
  bookingId: number;
  roomId: string;
  status: MeetingRoomStatus;
}
@Injectable()
export class MeetingRoomRepositoryImpl implements MeetingRoomRepository {
  constructor(
    @InjectRepository(MeetingRoomOrmEntity)
    private readonly repository: Repository<MeetingRoomOrmEntity>,
  ) {}

  async findByIdWithBooking(id: number): Promise<MeetingRoomOrmEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        booking: {
          student: true,
          instructor: true,
        },
      },
    });
  }

  async create(data: CreateMeetingRoomData, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(MeetingRoomOrmEntity)
      : this.repository;

    const meetingRoom = repository.create({
      bookingId: data.bookingId,
      roomId: data.roomId,
      status: data.status,
    });

    return repository.save(meetingRoom);
  }

  async markActive(id: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(MeetingRoomOrmEntity)
      .set({ status: MeetingRoomStatus.ACTIVE, startedAt: new Date() })
      .where('id = :id AND status = :status', {
        id,
        status: MeetingRoomStatus.WAITING,
      })
      .execute();
  }

  async markEnded(id: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(MeetingRoomOrmEntity)
      .set({ status: MeetingRoomStatus.ENDED, endedAt: new Date() })
      .where('id = :id AND status != :ended', {
        id,
        ended: MeetingRoomStatus.ENDED,
      })
      .execute();
  }

  async endExpiredRooms(): Promise<void> {
    await this.repository.query(
      `UPDATE meeting_rooms mr
       SET status = 'ENDED', ended_at = NOW()
       FROM bookings b
       WHERE mr.booking_id = b.id
         AND mr.status != 'ENDED'
         AND b.booking_date + b.end_time <= LOCALTIMESTAMP`,
    );
  }
}
