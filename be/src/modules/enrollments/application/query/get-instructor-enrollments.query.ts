import { AdminEnrollmentListResponseDto } from '@/modules/enrollments/presentation/dto/admin-enrollment-list-response.dto';

/** Danh sách enrollment theo instructor — kết quả của GetInstructorEnrollmentsQuery. */
export interface InstructorEnrollmentsPage {
  data: AdminEnrollmentListResponseDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export class GetInstructorEnrollmentsQuery {
  constructor(
    public readonly data: {
      instructorId: number;
      page: number;
      limit: number;
      keyword?: string;
      status?: number;
      courseId?: number;
    },
  ) {}
}
