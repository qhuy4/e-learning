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
import { PayoutAccountOrmEntity } from '@/modules/instructor-payouts/infrastructure/entity/payout-account.orm-entity';

@Entity({ name: 'instructor_payouts', schema: 'public' })
export class InstructorPayoutOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'instructor_id', type: 'bigint' })
  instructorId: string;

  @Column({ name: 'payout_account_id', type: 'bigint' })
  payoutAccountId: string;

  @Column({ name: 'period_start', type: 'date' })
  periodStart: string;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: string;

  @Column({ name: 'total_gross', type: 'numeric', precision: 14, scale: 2 })
  totalGross: string;

  @Column({ name: 'total_platform_fee', type: 'numeric', precision: 14, scale: 2 })
  totalPlatformFee: string;

  @Column({ name: 'total_instructor_amount', type: 'numeric', precision: 14, scale: 2 })
  totalInstructorAmount: string;

  @Column({ name: 'currency', type: 'char', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'status', type: 'smallint' })
  status: number;

  @Column({ name: 'payment_method', type: 'smallint' })
  paymentMethod: number;

  @Column({ name: 'transaction_ref', type: 'varchar', nullable: true })
  transactionRef: string | null;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'instructor_id' })
  instructor: UserOrmEntity;

  @ManyToOne(() => PayoutAccountOrmEntity)
  @JoinColumn({ name: 'payout_account_id' })
  payoutAccount: PayoutAccountOrmEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
