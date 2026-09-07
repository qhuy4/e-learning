import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KycStatus } from '@/modules/teacher/domain/enum/kyc-status.enum';

/**
 * Map với bảng `instructor_kyc`.
 * Lưu kết quả xác thực định danh (OCR CCCD/CMND + so khớp khuôn mặt)
 * thông qua bên thứ 3 FPT.AI eKYC.
 */
@Entity('instructor_kyc')
export class InstructorKycEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Index()
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({
    name: 'kyc_status',
    type: 'smallint',
    default: KycStatus.PENDING,
  })
  kycStatus: KycStatus;

  @Column({ name: 'identity_number', type: 'varchar', length: 255 })
  identityNumber: string;

  @Column({ name: 'identity_front', type: 'varchar', length: 255 })
  identityFront: string;

  @Column({ name: 'identity_back', type: 'varchar', length: 255 })
  identityBack: string;

  @Column({ name: 'selfie_with_id', type: 'varchar', length: 255 })
  selfieWithId: string;

  @Column({ name: 'ocr_verified', type: 'boolean', default: false })
  ocrVerified: boolean;

  @Column({ name: 'face_verified', type: 'boolean', default: false })
  faceVerified: boolean;

  /** Dữ liệu thô trả về từ API OCR của FPT.AI eKYC */
  @Column({ name: 'ocr_data', type: 'json', nullable: true })
  ocrData: Record<string, any> | null;

  /** Dữ liệu thô trả về từ API liveness + face-match của FPT.AI eKYC */
  @Column({ name: 'face_data', type: 'json', nullable: true })
  faceData: Record<string, any> | null;

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
}
