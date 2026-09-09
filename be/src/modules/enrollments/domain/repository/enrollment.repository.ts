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

  findById(id: number): Promise<any | null>;
}
