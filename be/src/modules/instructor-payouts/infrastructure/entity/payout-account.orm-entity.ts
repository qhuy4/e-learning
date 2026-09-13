import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';

@Entity({ name: 'instructor_payout_accounts', schema: 'public' })
export class PayoutAccountOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'instructor_profile_id', type: 'bigint' })
  instructorProfileId: string;

  @Column({ name: 'account_type', type: 'varchar' })
  accountType: string;

  @Column({ name: 'account_holder_name', type: 'varchar', length: 150 })
  accountHolderName: string;

  @Column({ name: 'account_number', type: 'varchar', nullable: true })
  accountNumber: string | null;

  @Column({ name: 'bank_name', type: 'varchar', nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_branch', type: 'varchar', nullable: true })
  bankBranch: string | null;

  @Column({ name: 'routing_code', type: 'varchar', nullable: true })
  routingCode: string | null;

  @Column({ name: 'paypal_email', type: 'varchar', nullable: true })
  paypalEmail: string | null;

  @Column({ name: 'external_ref', type: 'varchar', nullable: true })
  externalRef: string | null;

  @Column({ name: 'currency', type: 'char', length: 3, default: 'VND' })
  currency: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => InstructorProfileTypeOrmEntity)
  @JoinColumn({ name: 'instructor_profile_id' })
  instructorProfile: InstructorProfileTypeOrmEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
