import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';

@Entity('instructor_availability_exceptions')
export class InstructorAvailabilityExceptionOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  instructor_id: number;

  @Column({ type: 'date' })
  specific_date: string;

  @Column({ type: 'boolean', default: false })
  is_unavailable: boolean;

  /** true = exception cộng thêm giờ (mở rộng availability) thay vì chặn giờ. */
  @Column({ type: 'boolean', default: false })
  is_extra: boolean;

  @Column({ type: 'time', nullable: true })
  start_time: string | null;

  @Column({ type: 'time', nullable: true })
  end_time: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructor_id' })
  instructor: UserOrmEntity;
}
