import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamSectionOrmEntity } from './exam-section.orm-entity';
import { ExamMaterialOrmEntity } from './exam-material.orm-entity';
import { ExamQuestionTypeOrmEntity } from './exam-question-type.orm-entity';

@Entity({ name: 'exam_questions', schema: 'public' })
export class ExamQuestionOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'section_id', type: 'bigint' })
  sectionId: string;

  @ManyToOne(() => ExamSectionOrmEntity)
  @JoinColumn({ name: 'section_id' })
  section: ExamSectionOrmEntity;

  @Column({ name: 'material_id', type: 'bigint', nullable: true })
  materialId: string | null;

  @ManyToOne(() => ExamMaterialOrmEntity)
  @JoinColumn({ name: 'material_id' })
  material: ExamMaterialOrmEntity | null;

  @Column({ name: 'question_type_id', type: 'bigint' })
  questionTypeId: string;

  @ManyToOne(() => ExamQuestionTypeOrmEntity)
  @JoinColumn({ name: 'question_type_id' })
  questionType: ExamQuestionTypeOrmEntity;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 1 })
  points: number;

  @Column({ type: 'integer' })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
