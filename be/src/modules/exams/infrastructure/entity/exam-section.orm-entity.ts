import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamOrmEntity } from './exam.orm-entity';
import { ExamFormatSectionOrmEntity } from './exam-format-section.orm-entity';

@Entity({ name: 'exam_sections', schema: 'public' })
export class ExamSectionOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'exam_id', type: 'bigint' })
  examId: string;

  @ManyToOne(() => ExamOrmEntity)
  @JoinColumn({ name: 'exam_id' })
  exam: ExamOrmEntity;

  @Column({ name: 'format_section_id', type: 'bigint' })
  formatSectionId: string;

  @ManyToOne(() => ExamFormatSectionOrmEntity)
  @JoinColumn({ name: 'format_section_id' })
  formatSection: ExamFormatSectionOrmEntity;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @Column({ type: 'integer' })
  position: number;

  @Column({ name: 'duration_seconds', type: 'integer' })
  durationSeconds: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
