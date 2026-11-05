import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CertificateStatus } from '@/modules/instructors/domain/enum/certificate-status.enum';
import type { CertificateOcrData } from '@/modules/instructor-applications/domain/utils/extract-certificate-ocr';

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

  @Column({ name: 'file_key', type: 'varchar', length: 500, nullable: true })
  fileKey: string | null;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName: string | null;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType: string | null;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number | null;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[] | null;

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

  /** OCR được copy từ hồ sơ khi chứng chỉ được duyệt (bằng chứng đã xác minh). */
  @Column({
    name: 'ocr_status',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  ocrStatus: 'pending' | 'completed' | 'failed' | null;

  @Column({ name: 'ocr_raw_text', type: 'text', nullable: true })
  ocrRawText: string | null;

  @Column({ name: 'ocr_extracted_data', type: 'jsonb', nullable: true })
  ocrExtractedData: CertificateOcrData | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
