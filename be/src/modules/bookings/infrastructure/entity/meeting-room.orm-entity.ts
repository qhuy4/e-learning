import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BookingOrmEntity } from '@/modules/bookings/infrastructure/entity/booking.orm-entity';
import { MeetingRoomStatus } from '@/modules/bookings/domain/enum/meeting-room-status.enum';

@Entity('meeting_rooms')
export class MeetingRoomOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_id', unique: true })
  bookingId: number;

  @Column({ name: 'room_id', unique: true })
  roomId: string;

  @Column({ default: 'internal' })
  provider: string;

  @Column({
    type: 'enum',
    enum: MeetingRoomStatus,
    default: MeetingRoomStatus.WAITING,
  })
  status: MeetingRoomStatus;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => BookingOrmEntity)
  @JoinColumn({ name: 'booking_id' })
  booking: BookingOrmEntity;
}
