import { AdminEnrollmentListResponseDto } from '@/modules/enrollments/presentation/dto/admin-enrollment-list-response.dto';

/** Danh sách enrollment admin — kết quả của GetAdminEnrollmentsQuery. */
export interface AdminEnrollmentsPage {
  data: AdminEnrollmentListResponseDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export class GetAdminEnrollmentsQuery {
  constructor(
    public readonly data: {
      page: number;
      limit: number;
      keyword?: string;
      status?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {}
}
