import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';

@Entity({ name: 'review_reports', schema: 'public' })
export class ReviewReportOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'review_id', type: 'bigint' })
  reviewId: string;

  @Column({ name: 'reported_by', type: 'bigint' })
  reportedBy: string;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @Column({ name: 'status', type: 'smallint', default: 0 })
  status: number;

  @Column({ name: 'resolved_by', type: 'bigint', nullable: true })
  resolvedBy: string | null;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @ManyToOne(() => ReviewOrmEntity)
  @JoinColumn({ name: 'review_id' })
  review: ReviewOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'reported_by' })
  reporter: UserOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'resolved_by' })
  resolver: UserOrmEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
