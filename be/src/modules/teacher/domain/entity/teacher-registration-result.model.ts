import { ApprovalStatus } from '@/modules/teacher/domain/enum/approval-status.enum';
import { KycStatus } from '@/modules/teacher/domain/enum/kyc-status.enum';

/**
 * Model thuần domain (không phụ thuộc ORM) thể hiện kết quả sau khi
 * người dùng thực hiện đăng ký làm giáo viên.
 */
export class TeacherRegistrationResult {
  constructor(
    public readonly instructorProfileId: number,
    public readonly kycId: number,
    public readonly kycStatus: KycStatus,
    public readonly approvalStatus: ApprovalStatus,
    public readonly certificateIds: number[],
    public readonly kycMessage: string,
  ) {}
}
