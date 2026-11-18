import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingOrmEntity } from '@/modules/bookings/infrastructure/entity/booking.orm-entity';
import { BookingPaymentStatus } from '@/modules/bookings/domain/enum/booking-payment-status.enum';

/** Gateway transaction for a paid 1:1 booking. Kept separate from course orders. */
@Entity('booking_payments')
export class BookingPaymentOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_id', unique: true })
  bookingId: number;

  @Column({ length: 24, default: 'VNPAY' })
  gateway: string;

  @Column({ type: 'smallint', default: 1 })
  status: BookingPaymentStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 8, default: 'VND' })
  currency: string;

  @Column({ name: 'transaction_id', type: 'varchar', length: 100, nullable: true })
  transactionId: string | null;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => BookingOrmEntity)
  @JoinColumn({ name: 'booking_id' })
  booking: BookingOrmEntity;
}
