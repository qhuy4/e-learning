import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamSectionOrmEntity } from './exam-section.orm-entity';
import { ExamQuestionGroupOrmEntity } from './exam-question-group.orm-entity';
import { QuestionType } from '../../domain/enums/question-type.enum';

@Entity({ name: 'exam_questions', schema: 'public' })
export class ExamQuestionOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'section_id', type: 'bigint' })
  sectionId: string;

  @ManyToOne(() => ExamSectionOrmEntity)
  @JoinColumn({ name: 'section_id' })
  section: ExamSectionOrmEntity;

  @Column({ name: 'group_id', type: 'bigint', nullable: true })
  groupId: string | null;

  @ManyToOne(() => ExamQuestionGroupOrmEntity)
  @JoinColumn({ name: 'group_id' })
  group: ExamQuestionGroupOrmEntity | null;

  @Column({ type: 'varchar', length: 50 })
  type: QuestionType;

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
