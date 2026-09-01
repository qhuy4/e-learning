import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApprovalStatus } from '../../domain/enum/approval-status.enum';

/**
 * Map với bảng `instructor_profiles`.
 */
@Entity('instructor_profiles')
export class InstructorProfileEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Index()
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'headline', type: 'varchar', length: 200, nullable: true })
  headline: string | null;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  websiteUrl: string | null;

  @Column({ name: 'social_links', type: 'json', nullable: true })
  socialLinks: Record<string, string> | null;

  @Column({
    name: 'revenue_share_pct',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 70,
  })
  revenueSharePct: number;

  @Column({
    name: 'total_earned',
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
  })
  totalEarned: number;

  @Column({
    name: 'pending_payout',
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
  })
  pendingPayout: number;

  @Column({
    name: 'approval_status',
    type: 'smallint',
    default: ApprovalStatus.PENDING,
  })
  approvalStatus: ApprovalStatus;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'total_students', type: 'int', default: 0 })
  totalStudents: number;

  @Column({
    name: 'avg_rating',
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0,
  })
  avgRating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
