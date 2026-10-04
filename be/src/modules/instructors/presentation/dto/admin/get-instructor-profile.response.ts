import { PaginationMeta } from '@/common/pagination/pagination.meta';

export const ApprovalStatusResponse = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
} as const;

export type ApprovalStatusResponse =
  (typeof ApprovalStatusResponse)[keyof typeof ApprovalStatusResponse];

export interface GetInstructorListResponse {
  data: InstructorListItem[];
  meta: PaginationMeta;
}

export interface InstructorListItem {
  id: number;
  userId: number;

  name: string;
  email: string;
  avatarUrl: string | null;

  headline: string | null;
  approvalStatus: ApprovalStatusResponse;

  totalStudents: number;
  avgRating: number;

  revenueSharePct: number;

  createdAt: Date;
}
