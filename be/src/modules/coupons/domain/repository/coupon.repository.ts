import { Coupon } from '@/modules/coupons/domain/entity/coupon.entity';

export const COUPON_REPOSITORY = 'COUPON_REPOSITORY';

export interface AdminCouponsPage {
  data: Coupon[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ICouponRepository {
  findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    scope?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AdminCouponsPage>;

  findById(id: number): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  create(data: any): Promise<Coupon | null>;
  update(id: number, data: any): Promise<Coupon | null>;
  softDelete(id: number): Promise<void>;
  toggleActive(id: number): Promise<Coupon | null>;
  syncCourses(id: number, courseIds: number[]): Promise<void>;

  /** Mã đang hiệu lực (active + trong hạn + còn lượt) — sắp xếp mới nhất. */
  findActiveApplicable(courseId?: number, userId?: number): Promise<Coupon[]>;
  /** Tăng used_count sau khi ghi nhận sử dụng mã. */
  incrementUsedCount(id: number): Promise<void>;
}
