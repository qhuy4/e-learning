import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { CouponCourseOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon-course.orm-entity';

@Entity({ name: 'coupons', schema: 'public' })
export class CouponOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'created_by', type: 'bigint' })
  createdBy: string;

  @Column({ name: 'code', type: 'varchar', length: 32, unique: true })
  code: string;

  @Column({ name: 'discount_type', type: 'varchar' })
  discountType: string;

  @Column({ name: 'discount_value', type: 'numeric', precision: 10, scale: 2 })
  discountValue: string;

  @Column({
    name: 'min_order_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  minOrderAmount: string;

  @Column({
    name: 'max_discount_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxDiscountAmount: string | null;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit: number | null;

  @Column({ name: 'usage_limit_per_user', type: 'int', default: 1 })
  usageLimitPerUser: number;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @Column({ name: 'scope', type: 'varchar' })
  scope: string;

  @Column({ name: 'coupon_owner_type', type: 'varchar' })
  couponOwnerType: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'valid_from', type: 'timestamp' })
  validFrom: Date;

  @Column({ name: 'valid_until', type: 'timestamp', nullable: true })
  validUntil: Date | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'recipient_user_id', type: 'bigint', nullable: true })
  recipientUserId: string | null;

  @Column({ name: 'max_booking_minutes', type: 'int', nullable: true })
  maxBookingMinutes: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'created_by' })
  creator: UserOrmEntity;

  @OneToMany(() => CouponCourseOrmEntity, (cc) => cc.coupon)
  couponCourses: CouponCourseOrmEntity[];
}
