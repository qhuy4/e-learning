import { CouponOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon.orm-entity';
import { Coupon } from '@/modules/coupons/domain/entity/coupon.entity';
import { CouponType } from '@/modules/coupons/domain/enum/coupon-type.enum';
import { CouponScope } from '@/modules/coupons/domain/enum/coupon-scope.enum';
import { CouponOwnerType } from '@/modules/coupons/domain/enum/coupon-owner-type.enum';

export class CouponMapper {
  static toDomain(entity: CouponOrmEntity): Coupon {
    const courses = entity.couponCourses?.map((cc) =>
      cc.course
        ? { id: Number(cc.course.id), title: cc.course.title, thumbnail: cc.course.thumbnail, price: Number(cc.course.price) }
        : { id: Number(cc.courseId) },
    );

    return Coupon.restore({
      id: Number(entity.id),
      createdBy: Number(entity.createdBy),
      code: entity.code,
      discountType: entity.discountType as CouponType,
      discountValue: Number(entity.discountValue),
      minOrderAmount: Number(entity.minOrderAmount),
      maxDiscountAmount: entity.maxDiscountAmount ? Number(entity.maxDiscountAmount) : null,
      usageLimit: entity.usageLimit,
      usageLimitPerUser: entity.usageLimitPerUser,
      usedCount: entity.usedCount,
      scope: entity.scope as CouponScope,
      couponOwnerType: entity.couponOwnerType as CouponOwnerType,
      isActive: entity.isActive,
      validFrom: entity.validFrom,
      description: entity.description,
      validUntil: entity.validUntil,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      courses,
      creator: entity.creator
        ? { id: entity.creator.id, name: entity.creator.name }
        : undefined,
    });
  }
}
