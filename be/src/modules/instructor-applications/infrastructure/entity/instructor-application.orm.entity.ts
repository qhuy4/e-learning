import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InstructorApplicationStatus } from '@/modules/instructor-applications/domain/enums/instructor-application-status.enum';

@Entity('instructor_applications')
export class InstructorApplicationOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Index()
  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({ name: 'headline', type: 'varchar', length: 200, nullable: true })
  headline: string | null;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  websiteUrl: string | null;

  @Column({ name: 'social_links', type: 'json', nullable: true })
  socialLinks: Record<string, string> | null;

  @Index()
  @Column({
    name: 'status',
    type: 'varchar',
    length: 32,
    default: InstructorApplicationStatus.PENDING_SUBMISSION,
  })
  status: InstructorApplicationStatus;

  @Column({ name: 'review_reason', type: 'text', nullable: true })
  reviewReason: string | null;

  @Column({ name: 'reviewed_by', type: 'bigint', nullable: true })
  reviewedBy: number | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Index()
  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId: number | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'activated_at', type: 'timestamptz', nullable: true })
  activatedAt: Date | null;

  @Column({ name: 'requires_password', type: 'boolean', default: false })
  requiresPassword: boolean;

  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
