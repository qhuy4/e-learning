export const ENROLLMENT_REPOSITORY = 'ENROLLMENT_REPOSITORY';

export interface IEnrollmentRepository {
  findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    status?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;

  findAllByInstructorId(options: {
    instructorId: number;
    page: number;
    limit: number;
    keyword?: string;
    status?: number;
    courseId?: number;
  }): Promise<{ data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;

  findById(id: number): Promise<any | null>;

  findByUserAndCourse(userId: number, courseId: number): Promise<any | null>;

  findByUser(
    userId: number,
    options?: {
      page?: number;
      limit?: number;
      keyword?: string;
      status?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ data: any[]; total: number }>;

  create(enrollment: any): Promise<any>;

  existsActiveByUserAndCourse(userId: number, courseId: number): Promise<boolean>;

  existsActiveByUserAndCourseSlug(userId: number, courseSlug: string): Promise<boolean>;
}
