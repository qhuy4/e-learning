import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';

@Entity('instructor_profiles')
export class InstructorProfileTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @OneToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'varchar', length: 200, nullable: true })
  headline: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  websiteUrl: string | null;

  @Column({ name: 'social_links', type: 'json', nullable: true })
  socialLinks: Record<string, any> | null;

  @Column({
    name: 'revenue_share_pct',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 70,
  })
  revenueSharePct: number;

  @Column({
    name: 'total_earned',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  totalEarned: number;

  @Column({
    name: 'pending_payout',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  pendingPayout: number;

  @Index()
  @Column({
    name: 'approval_status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.APPROVED,
  })
  approvalStatus: ApprovalStatus;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'total_students', type: 'int', default: 0 })
  totalStudents: number;

  @Column({
    name: 'avg_rating',
    type: 'decimal',
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
