import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';
import { SkillEvidenceStatus } from '@/modules/skill-profiling/domain/enum/skill-evidence-status.enum';
import {
  SkillCapability,
  SkillVerification,
} from '@/modules/skill-profiling/domain/enum/skill-verification.enum';

@Entity('instructor_skill_evidences')
@Index('idx_instructor_skill_evidences_inst_skill_status', [
  'instructor_id',
  'skill_id',
  'status',
])
@Index('idx_instructor_skill_evidences_source', ['source_type', 'source_id'])
export class InstructorSkillEvidenceOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'instructor_id', type: 'bigint' })
  instructor_id: number;

  @Column({ name: 'skill_id', type: 'bigint' })
  skill_id: number;

  @Column({ name: 'source_type', type: 'enum', enum: SkillSourceType })
  source_type: SkillSourceType;

  @Column({ name: 'source_id', type: 'varchar', length: 100, nullable: true })
  source_id: string | null;

  @Column({ type: 'numeric', precision: 4, scale: 3 })
  score: number;

  /** Base-weight snapshot taken from config at write time (audit trail). */
  @Column({ type: 'numeric', precision: 5, scale: 4 })
  weight: number;

  @Column({ type: 'numeric', precision: 4, scale: 3 })
  confidence: number;

  @Column({ name: 'observed_at', type: 'timestamp' })
  observed_at: Date;

  @Column({ name: 'extractor_version', type: 'varchar', length: 30 })
  extractor_version: string;

  @Column({
    type: 'enum',
    enum: SkillEvidenceStatus,
    default: SkillEvidenceStatus.ACTIVE,
  })
  status: SkillEvidenceStatus;

  /** Nguồn gốc độ tin cậy: xác minh / tự khai / suy luận. */
  @Column({
    type: 'varchar',
    length: 10,
    default: SkillVerification.INFERRED,
  })
  verification: SkillVerification;

  /** Ngôn ngữ (chứng chỉ) hay sư phạm (hoạt động giảng dạy). */
  @Column({
    type: 'varchar',
    length: 20,
    default: SkillCapability.TEACHING,
  })
  capability: SkillCapability;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    content_hash?: string;
    rationale?: string;
    independence_key?: string;
    [key: string]: unknown;
  } | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;
}
