import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CertificateStatus } from '@/modules/teacher/domain/enum/certificate-status.enum';

/**
 * Map với bảng `instructor_certificates`.
 * Mỗi record là 1 bằng cấp/chứng chỉ mà giáo viên nộp kèm hồ sơ.
 */
@Entity('instructor_certificates')
export class InstructorCertificateEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Index()
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'certificate_name', type: 'varchar', length: 255 })
  certificateName: string;

  @Column({ name: 'issuer', type: 'varchar', length: 255, nullable: true })
  issuer: string | null;

  @Column({ name: 'file_path', type: 'varchar', length: 255 })
  filePath: string;

  @Column({ name: 'issued_at', type: 'date', nullable: true })
  issuedAt: string | null;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt: string | null;

  @Column({
    name: 'certificate_status',
    type: 'smallint',
    default: CertificateStatus.PENDING,
  })
  certificateStatus: CertificateStatus;

  @Column({ name: 'reviewed_by', type: 'bigint', nullable: true })
  reviewedBy: number | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
