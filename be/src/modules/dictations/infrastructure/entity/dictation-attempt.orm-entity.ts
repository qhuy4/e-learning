import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'dictation_attempts', schema: 'public' })
export class DictationAttemptOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'dictation_id', type: 'bigint' })
  dictationId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  accuracy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date | null;
}
