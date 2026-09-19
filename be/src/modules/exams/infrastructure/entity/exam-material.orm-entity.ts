import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamSectionOrmEntity } from './exam-section.orm-entity';
import { ExamMaterialType } from '../../domain/enums/exam-material-type.enum';

@Entity({ name: 'exam_materials', schema: 'public' })
export class ExamMaterialOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'section_id', type: 'bigint' })
  sectionId: string;

  @ManyToOne(() => ExamSectionOrmEntity)
  @JoinColumn({ name: 'section_id' })
  section: ExamSectionOrmEntity;

  @Column({ type: 'enum', enum: ExamMaterialType })
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
