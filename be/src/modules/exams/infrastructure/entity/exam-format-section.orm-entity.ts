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

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @Column({ type: 'integer' })
  position: number;

  @Column({ name: 'duration_seconds', type: 'integer', nullable: true })
  durationSeconds: number | null;

  @Column({ name: 'question_count', type: 'integer', default: 0 })
  questionCount: number;

  /**
   * Kỹ năng của phần thi — LISTENING / READING / WRITING / SPEAKING.
   * Nguồn sự thật thay cho so khớp TÊN khi gen đề từ format.
   */
  @Column({ name: 'section_type', type: 'varchar', length: 20, nullable: true })
  sectionType: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
