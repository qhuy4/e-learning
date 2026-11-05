import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SkillAssessmentStatus } from '../../domain/enum/skill-assessment-status.enum';

@Entity('instructor_skill_profiles')
@Index(
  'uq_instructor_skill_profiles_instructor_skill',
  ['instructor_id', 'skill_id'],
  {
    unique: true,
  },
)
@Index('idx_instructor_skill_profiles_skill_score', ['skill_id', 'score'])
export class InstructorSkillProfileOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'instructor_id', type: 'bigint' })
  instructor_id: number;

  @Column({ name: 'skill_id', type: 'bigint' })
  skill_id: number;

  @Column({ type: 'numeric', precision: 4, scale: 3, nullable: true })
  score: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 3, nullable: true })
  confidence: number | null;

  @Column({
    name: 'assessment_status',
    type: 'varchar',
    length: 30,
    default: SkillAssessmentStatus.PROVISIONAL,
  })
  assessment_status: SkillAssessmentStatus;

  @Column({ name: 'evidence_count', type: 'int', default: 0 })
  evidence_count: number;

  @Column({ name: 'independent_evidence_count', type: 'int', default: 0 })
  independent_evidence_count: number;

  @Column({ name: 'current_run_id', type: 'bigint', nullable: true })
  current_run_id: number | null;

  /** Tỷ lệ trọng số bằng chứng đã xác minh trên tổng trọng số (0..1). */
  @Column({
    name: 'verified_ratio',
    type: 'numeric',
    precision: 4,
    scale: 3,
    default: 0,
  })
  verified_ratio: number;

  @Column({ name: 'model_version', type: 'varchar', length: 30 })
  model_version: string;

  @Column({
    name: 'model_kind',
    type: 'varchar',
    length: 10,
    default: 'heuristic',
  })
  model_kind: string;

  @Column({
    name: 'score_model',
    type: 'numeric',
    precision: 4,
    scale: 3,
    nullable: true,
  })
  score_model: number | null;

  @Column({ name: 'computed_at', type: 'timestamp' })
  computed_at: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}
