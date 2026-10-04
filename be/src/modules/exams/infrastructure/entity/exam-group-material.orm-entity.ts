import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamQuestionGroupOrmEntity } from './exam-question-group.orm-entity';
import { ExamMaterialType } from '../../domain/enums/exam-material-type.enum';

@Entity({ name: 'exam_group_materials', schema: 'public' })
export class ExamGroupMaterialOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'group_id', type: 'bigint' })
  groupId: string;

  @ManyToOne(() => ExamQuestionGroupOrmEntity)
  @JoinColumn({ name: 'group_id' })
  group: ExamQuestionGroupOrmEntity;

  @Column({ type: 'varchar', length: 50 })
  type: ExamMaterialType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl: string | null;

  @Column({ type: 'text', nullable: true })
  transcript: string | null;

  @Column({ type: 'integer' })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
