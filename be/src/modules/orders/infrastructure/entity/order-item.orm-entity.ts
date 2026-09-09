import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderOrmEntity } from '@/modules/orders/infrastructure/entity/order.orm-entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';

@Entity({ name: 'order_items', schema: 'public' })
export class OrderItemOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'order_id', type: 'bigint' })
  orderId: string;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @Column({ name: 'instructor_id', type: 'bigint' })
  instructorId: string;

  @Column({ name: 'unit_price', type: 'numeric', precision: 10, scale: 2, default: 0 })
  unitPrice: string;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  discountAmount: string;

  @Column({ name: 'final_price', type: 'numeric', precision: 10, scale: 2, default: 0 })
  finalPrice: string;

  @ManyToOne(() => OrderOrmEntity, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: OrderOrmEntity;

  @ManyToOne(() => CourseOrmEntity)
  @JoinColumn({ name: 'course_id' })
  course: CourseOrmEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
