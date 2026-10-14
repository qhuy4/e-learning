import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamSectionOrmEntity } from './exam-section.orm-entity';
import { ExamGroupType } from '../../domain/enums/exam-group-type.enum';

@Entity({ name: 'exam_question_groups', schema: 'public' })
export class ExamQuestionGroupOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'section_id', type: 'bigint' })
  sectionId: string;

  @ManyToOne(() => ExamSectionOrmEntity)
  @JoinColumn({ name: 'section_id' })
  section: ExamSectionOrmEntity;

  @Column({ name: 'group_type', type: 'varchar', length: 50, default: ExamGroupType.CUSTOM })
  groupType: ExamGroupType;

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @Column({ type: 'integer' })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
