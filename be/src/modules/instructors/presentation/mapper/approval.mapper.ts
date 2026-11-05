import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';

export function mapApprovalStatus(status: ApprovalStatus): string {
  switch (status) {
    case ApprovalStatus.PENDING:
      return 'PENDING';

    case ApprovalStatus.APPROVED:
      return 'APPROVED';

    case ApprovalStatus.SUSPENDED:
      return 'SUSPENDED';

    case ApprovalStatus.REJECTED:
      return 'REJECTED';

    default:
      return 'UNKNOWN';
  }
}
