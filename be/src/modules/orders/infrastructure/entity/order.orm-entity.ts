import {
  Column,
  Entity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItemOrmEntity } from '@/modules/orders/infrastructure/entity/order-item.orm-entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';

@Entity({ name: 'orders', schema: 'public' })
@Index('idx_orders_status', ['status'])
export class OrderOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'coupon_id', type: 'bigint', nullable: true })
  couponId: string | null;

  @Column({ name: 'order_code', type: 'varchar', length: 255, unique: true })
  orderCode: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  subtotal: string;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  discountAmount: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  total: string;

  @Column({ type: 'varchar', length: 10, default: 'VND' })
  currency: string;

  @Column({ type: 'varchar', length: 255, default: '0' })
  status: string;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @OneToMany(() => OrderItemOrmEntity, (item) => item.order)
  items: OrderItemOrmEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
