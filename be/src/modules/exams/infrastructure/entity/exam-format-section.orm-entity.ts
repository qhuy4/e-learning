import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamFormatOrmEntity } from './exam-format.orm-entity';

@Entity({ name: 'exam_format_sections', schema: 'public' })
export class ExamFormatSectionOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'exam_format_id', type: 'bigint' })
  examFormatId: string;

  @ManyToOne(() => ExamFormatOrmEntity)
  @JoinColumn({ name: 'exam_format_id' })
  examFormat: ExamFormatOrmEntity;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @Column({ type: 'integer' })
  position: number;

  @Column({ name: 'duration_seconds', type: 'integer' })
  durationSeconds: number;

  @Column({ name: 'question_count', type: 'integer', default: 0 })
  questionCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
