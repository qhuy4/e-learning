import { UserStatus } from '@/modules/users/domain/enum/user.status';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';

export interface FindInstructorsOptions {
  page: number;
  limit: number;
  keyword?: string;
  status?: UserStatus;
  approvalStatus?: ApprovalStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
