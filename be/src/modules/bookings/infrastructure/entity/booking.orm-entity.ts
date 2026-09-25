import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { MeetingRoomOrmEntity } from '@/modules/bookings/infrastructure/entity/meeting-room.orm-entity';

@Entity('bookings')
export class BookingOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  student_id: number;

  @Column({ type: 'bigint' })
  instructor_id: number;

  @Column({ type: 'date' })
  booking_date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: UserOrmEntity;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructor_id' })
  instructor: UserOrmEntity;

  @OneToOne(() => MeetingRoomOrmEntity, (room) => room.booking)
  meetingRoom: MeetingRoomOrmEntity | null;
}
