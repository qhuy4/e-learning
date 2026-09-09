import { Coupon } from '@/modules/coupons/domain/entity/coupon.entity';

export class AdminCouponListResponseMapper {
  static toResponse(coupon: Coupon) {
    return {
      id: coupon.id,
      createdBy: coupon.createdBy,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      usageLimit: coupon.usageLimit,
      usageLimitPerUser: coupon.usageLimitPerUser,
      usedCount: coupon.usedCount,
      scope: coupon.scope,
      couponOwnerType: coupon.couponOwnerType,
      isActive: coupon.isActive,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      description: coupon.description,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
      courses: coupon.courses,
      creator: coupon.creator,
    };
  }
}
