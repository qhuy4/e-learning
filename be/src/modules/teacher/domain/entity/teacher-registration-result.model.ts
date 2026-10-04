import { ApprovalStatus } from '@/modules/teacher/domain/enum/approval-status.enum';

/**
 * Model thuần domain (không phụ thuộc ORM) thể hiện kết quả sau khi
 * người dùng thực hiện đăng ký làm giáo viên.
 */
export class TeacherRegistrationResult {
  constructor(
    public readonly instructorProfileId: number,
    public readonly approvalStatus: ApprovalStatus,
    public readonly certificateIds: number[],
    public readonly message: string,
  ) {}
}
