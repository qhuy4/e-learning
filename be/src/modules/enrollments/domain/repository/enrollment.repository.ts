import { Enrollment } from '@/modules/enrollments/domain/entity/enrollment.entity';

export const ENROLLMENT_REPOSITORY = Symbol('ENROLLMENT_REPOSITORY');

export interface IEnrollmentRepository {
  findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    status?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Enrollment[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;

  findById(id: number): Promise<Enrollment | null>;

  findByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | null>;

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
  ): Promise<{ data: Enrollment[]; total: number }>;

  create(enrollment: Enrollment): Promise<Enrollment>;

  existsActiveByUserAndCourse(userId: number, courseId: number): Promise<boolean>;

  existsActiveByUserAndCourseSlug(userId: number, courseSlug: string): Promise<boolean>;
}
