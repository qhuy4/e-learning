import { CouponType } from '@/modules/coupons/domain/enum/coupon-type.enum';
import { CouponScope } from '@/modules/coupons/domain/enum/coupon-scope.enum';
import { CouponOwnerType } from '@/modules/coupons/domain/enum/coupon-owner-type.enum';

/** Khóa học áp dụng mã — `title/thumbnail/price` chỉ có khi relation `course` được load. */
export interface CouponCourseInfo {
  id: number;
  title?: string;
  thumbnail?: string | null;
  price?: number;
}

/** Người tạo mã (relation `creator`). */
export interface CouponCreatorInfo {
  id: number;
  name: string;
}

export class Coupon {
  private constructor(
    public readonly id: number | null,
    public readonly createdBy: number,
    public readonly code: string,
    public readonly discountType: CouponType,
    public readonly discountValue: number,
    public readonly minOrderAmount: number,
    public readonly maxDiscountAmount: number | null,
    public readonly usageLimit: number | null,
    public readonly usageLimitPerUser: number,
    public readonly usedCount: number,
    public readonly scope: CouponScope,
    public readonly couponOwnerType: CouponOwnerType,
    public readonly isActive: boolean,
    public readonly validFrom: Date,
    public readonly description: string | null,
    public readonly validUntil: Date | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public readonly recipientUserId: number | null,
    public readonly maxBookingMinutes: number | null,
    public courses?: CouponCourseInfo[],
    public creator?: CouponCreatorInfo,
  ) {}

  static restore(params: {
    id: number;
    createdBy: number;
    code: string;
    discountType: CouponType;
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount: number | null;
    usageLimit: number | null;
    usageLimitPerUser: number;
    usedCount: number;
    scope: CouponScope;
    couponOwnerType: CouponOwnerType;
    isActive: boolean;
    validFrom: Date;
    description: string | null;
    validUntil: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    recipientUserId?: number | null;
    maxBookingMinutes?: number | null;
    courses?: CouponCourseInfo[];
    creator?: CouponCreatorInfo;
  }): Coupon {
    return new Coupon(
      params.id,
      params.createdBy,
      params.code,
      params.discountType,
      params.discountValue,
      params.minOrderAmount,
      params.maxDiscountAmount,
      params.usageLimit,
      params.usageLimitPerUser,
      params.usedCount,
      params.scope,
      params.couponOwnerType,
      params.isActive,
      params.validFrom,
      params.description,
      params.validUntil,
      params.createdAt,
      params.updatedAt,
      params.recipientUserId ?? null,
      params.maxBookingMinutes ?? null,
      params.courses,
      params.creator,
    );
  }
}
