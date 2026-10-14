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
   * Kỹ năng của phần thi (kế thừa từ exam_format_sections.section_type khi
   * gen đề) — LISTENING / READING / WRITING / SPEAKING. FE đọc cột này thay
   * vì đoán qua tên section.
   */
  @Column({ name: 'section_type', type: 'varchar', length: 20, nullable: true })
  sectionType: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
