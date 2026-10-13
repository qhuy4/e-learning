export const COUPON_REPOSITORY = 'COUPON_REPOSITORY';

export interface ICouponRepository {
  findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    scope?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } }>;

  findById(id: number): Promise<any | null>;
  findByCode(code: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: number, data: any): Promise<any>;
  softDelete(id: number): Promise<void>;
  toggleActive(id: number): Promise<any>;
  syncCourses(id: number, courseIds: number[]): Promise<void>;

  /** Mã đang hiệu lực (active + trong hạn + còn lượt) — sắp xếp mới nhất. */
  findActiveApplicable(courseId?: number): Promise<any[]>;
  /** Tăng used_count sau khi ghi nhận sử dụng mã. */
  incrementUsedCount(id: number): Promise<void>;
}
