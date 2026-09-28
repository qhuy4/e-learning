import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'dictation_sentences', schema: 'public' })
export class DictationSentenceOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'dictation_id', type: 'bigint' })
  dictationId: string;

  @Column({ type: 'text' })
  sentence: string;

  @Column({ name: 'start_time', type: 'integer' })
  startTime: number;

  @Column({ name: 'end_time', type: 'integer' })
  endTime: number;

  @Column({ type: 'integer' })
  position: number;

  @Column({ type: 'text', nullable: true })
  hint: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
