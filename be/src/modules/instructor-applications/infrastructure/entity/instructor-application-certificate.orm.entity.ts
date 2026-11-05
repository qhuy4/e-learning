import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InstructorApplicationCertificateStatus } from '@/modules/instructor-applications/domain/enums/instructor-application-certificate-status.enum';
import type { CertificateOcrData } from '@/modules/instructor-applications/domain/utils/extract-certificate-ocr';

@Entity('instructor_application_certificates')
export class InstructorApplicationCertificateOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Index()
  @Column({ name: 'application_id', type: 'bigint' })
  applicationId: number;

  @Column({ name: 'certificate_name', type: 'varchar', length: 255 })
  certificateName: string;

  @Column({ name: 'issuer', type: 'varchar', length: 255, nullable: true })
  issuer: string | null;

  @Column({ name: 'issued_at', type: 'date', nullable: true })
  issuedAt: string | null;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt: string | null;

  @Column({ name: 'file_key', type: 'varchar', length: 500, nullable: true })
  fileKey: string | null;

  @Column({
    name: 'legacy_file_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  legacyFilePath: string | null;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName: string | null;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType: string | null;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: InstructorApplicationCertificateStatus.PENDING,
  })
  status: InstructorApplicationCertificateStatus;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[] | null;

  @Column({ name: 'reviewed_by', type: 'bigint', nullable: true })
  reviewedBy: number | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({
    name: 'ocr_status',
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  ocrStatus: 'pending' | 'completed' | 'failed';

  @Column({
    name: 'ocr_raw_text',
    type: 'text',
    nullable: true,
  })
  ocrRawText: string | null;

  @Column({
    name: 'ocr_extracted_data',
    type: 'jsonb',
    nullable: true,
  })
  ocrExtractedData: CertificateOcrData | null;
}
