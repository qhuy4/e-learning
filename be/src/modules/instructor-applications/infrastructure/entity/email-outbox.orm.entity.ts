import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmailOutboxStatus } from '@/modules/instructor-applications/domain/enums/email-outbox-status.enum';

@Entity('email_outbox')
export class EmailOutboxOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Index()
  @Column({ name: 'to_email', type: 'varchar', length: 255 })
  toEmail: string;

  @Column({ name: 'template', type: 'varchar', length: 50 })
  template: string;

  @Column({ name: 'payload', type: 'jsonb' })
  payload: Record<string, unknown>;

  @Index()
  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: EmailOutboxStatus.PENDING,
  })
  status: EmailOutboxStatus;

  @Column({ name: 'attempts', type: 'int', default: 0 })
  attempts: number;

  @Index()
  @Column({
    name: 'next_attempt_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  nextAttemptAt: Date;

  @Column({ name: 'locked_at', type: 'timestamptz', nullable: true })
  lockedAt: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
