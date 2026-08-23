import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'instructor_profiles', schema: 'public' })
@Index('idx_instructor_profiles_user_id', ['userId'])
export class InstructorProfileOrmEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  headline: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  websiteUrl: string | null;

  @Column({ name: 'social_links', type: 'json', nullable: true })
  socialLinks: Record<string, unknown> | null;

  @Column({
    name: 'revenue_share_pct',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 70,
  })
  revenueSharePct: string;

  @Column({
    name: 'total_earned',
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
  })
  totalEarned: string;

  @Column({
    name: 'pending_payout',
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
  })
  pendingPayout: string;

  @Column({ name: 'approval_status', type: 'smallint', default: 1 })
  approvalStatus: number;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'total_students', type: 'integer', default: 0 })
  totalStudents: number;

  @Column({
    name: 'avg_rating',
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0,
  })
  avgRating: string;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
