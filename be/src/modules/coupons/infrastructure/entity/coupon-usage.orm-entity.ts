import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CouponOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon.orm-entity';

@Entity({ name: 'coupon_usages', schema: 'public' })
export class CouponUsageOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'coupon_id', type: 'bigint' })
  couponId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'order_id', type: 'bigint' })
  orderId: string;

  @Column({ name: 'discount_applied', type: 'numeric', precision: 10, scale: 2 })
  discountApplied: string;

  @Column({ name: 'used_at', type: 'timestamp' })
  usedAt: Date;

  @ManyToOne(() => CouponOrmEntity)
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponOrmEntity;
}
