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
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { OrderItemOrmEntity } from '@/modules/orders/infrastructure/entity/order-item.orm-entity';

@Entity({ name: 'revenue_splits', schema: 'public' })
export class RevenueSplitOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'order_item_id', type: 'bigint' })
  orderItemId: string;

  @Column({ name: 'instructor_id', type: 'bigint' })
  instructorId: string;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @Column({ name: 'gross_amount', type: 'numeric', precision: 12, scale: 2 })
  grossAmount: string;

  @Column({ name: 'platform_fee_pct', type: 'numeric', precision: 5, scale: 2 })
  platformFeePct: string;

  @Column({ name: 'platform_fee_amount', type: 'numeric', precision: 12, scale: 2 })
  platformFeeAmount: string;

  @Column({ name: 'instructor_share_pct', type: 'numeric', precision: 5, scale: 2 })
  instructorSharePct: string;

  @Column({ name: 'instructor_amount', type: 'numeric', precision: 12, scale: 2 })
  instructorAmount: string;

  @Column({ name: 'coupon_discount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  couponDiscount: string;

  @Column({ name: 'payout_status', type: 'varchar' })
  payoutStatus: string;

  @ManyToOne(() => OrderItemOrmEntity)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItemOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'instructor_id' })
  instructor: UserOrmEntity;

  @ManyToOne(() => CourseOrmEntity)
  @JoinColumn({ name: 'course_id' })
  course: CourseOrmEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
