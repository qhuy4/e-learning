import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  COUPON_REPOSITORY,
  ICouponRepository,
} from '@/modules/coupons/domain/repository/coupon.repository';
import { Coupon } from '@/modules/coupons/domain/entity/coupon.entity';
import { CouponUsageOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon-usage.orm-entity';
import { CouponType } from '@/modules/coupons/domain/enum/coupon-type.enum';
import { CouponScope } from '@/modules/coupons/domain/enum/coupon-scope.enum';

/** Dữ liệu mã giảm giá công khai (không lộ thông tin nội bộ). */
export interface PublicCoupon {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  description: string | null;
  validUntil: string | null;
  scope: string;
}

export interface CouponValidation {
  coupon: Coupon;
  discountAmount: number;
}

/**
 * Logic dùng chung cho voucher: liệt kê mã khả dụng,
 * kiểm tra điều kiện + tính số tiền giảm, ghi nhận sử dụng.
 */
@Injectable()
export class CouponRedemptionService {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
    @InjectRepository(CouponUsageOrmEntity)
    private readonly usageRepository: Repository<CouponUsageOrmEntity>,
  ) {}

  toPublic(coupon: Coupon): PublicCoupon {
    return {
      id: Number(coupon.id),
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      description: coupon.description,
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString() : null,
      scope: coupon.scope,
    };
  }

  /** Danh sách mã đang hiệu lực (đã lọc theo scope khóa học + lượt của riêng user). */
  async listActiveForUser(userId: number, courseId?: number): Promise<PublicCoupon[]> {
    const coupons: Coupon[] = await this.couponRepository.findActiveApplicable(courseId);

    const result: PublicCoupon[] = [];
    for (const coupon of coupons) {
      if (coupon.usageLimitPerUser > 0 && coupon.id != null) {
        const used = await this.usageRepository.count({
          where: {
            couponId: coupon.id.toString(),
            userId: userId.toString(),
          },
        });
        if (used >= coupon.usageLimitPerUser) continue;
      }
      result.push(this.toPublic(coupon));
    }
    return result;
  }

  /**
   * Kiểm tra một mã có hợp lệ không và tính số tiền giảm thực tế.
   * Ném BadRequestException với thông báo tiếng Việt nếu không hợp lệ.
   */
  async validate(params: {
    userId: number;
    code?: string;
    couponId?: number;
    courseId?: number;
    amount: number;
  }): Promise<CouponValidation> {
    const { userId, code, couponId, courseId, amount } = params;

    if (!code && !couponId) {
      throw new BadRequestException('Vui lòng chọn mã giảm giá');
    }

    const coupon = code
      ? await this.couponRepository.findByCode(code.trim())
      : await this.couponRepository.findById(Number(couponId));

    if (!coupon) {
      throw new BadRequestException('Mã giảm giá không tồn tại');
    }
    if (!coupon.isActive) {
      throw new BadRequestException('Mã giảm giá đã bị vô hiệu hóa');
    }

    const now = new Date();
    if (new Date(coupon.validFrom) > now) {
      throw new BadRequestException('Mã giảm giá chưa có hiệu lực');
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      throw new BadRequestException('Mã giảm giá đã hết hạn');
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    // Scope: nếu mã chỉ áp dụng cho vài khóa học nhất định
    if (courseId != null && coupon.scope === CouponScope.SPECIFIC_COURSES) {
      const courseIds = (coupon.courses ?? []).map((c: any) =>
        Number(c?.id ?? c?.courseId ?? c),
      );
      if (!courseIds.includes(Number(courseId))) {
        throw new BadRequestException('Mã giảm giá không áp dụng cho khóa học này');
      }
    }

    if (coupon.minOrderAmount > 0 && amount < coupon.minOrderAmount) {
      throw new BadRequestException(
        `Đơn hàng cần tối thiểu ${coupon.minOrderAmount.toLocaleString('vi-VN')} ₫ để dùng mã này`,
      );
    }

    if (coupon.usageLimitPerUser > 0 && coupon.id != null) {
      const used = await this.usageRepository.count({
        where: {
          couponId: coupon.id.toString(),
          userId: userId.toString(),
        },
      });
      if (used >= coupon.usageLimitPerUser) {
        throw new BadRequestException('Bạn đã sử dụng mã giảm giá này');
      }
    }

    const discountAmount = this.computeDiscount(coupon, amount);
    if (discountAmount <= 0) {
      throw new BadRequestException('Mã giảm giá không đủ điều kiện giảm cho đơn hàng này');
    }

    return { coupon, discountAmount };
  }

  /** Tính số tiền giảm: PHẦN TRĂM (có cap) hoặc CỐ ĐỊNH, không vượt quá đơn hàng. */
  computeDiscount(coupon: Coupon, amount: number): number {
    let discount =
      coupon.discountType === CouponType.PERCENTAGE
        ? Math.floor((amount * coupon.discountValue) / 100)
        : coupon.discountValue;

    if (coupon.maxDiscountAmount !== null) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
    return Math.max(0, Math.min(discount, amount));
  }

  /** Ghi nhận sử dụng: bản ghi coupon_usages + tăng used_count. */
  async recordUsage(
    coupon: Coupon,
    userId: number,
    orderId: number,
    discountAmount: number,
  ): Promise<void> {
    if (coupon.id == null) return;

    await this.usageRepository.save(
      this.usageRepository.create({
        couponId: coupon.id.toString(),
        userId: userId.toString(),
        orderId: orderId.toString(),
        discountApplied: discountAmount.toString(),
        usedAt: new Date(),
      }),
    );
    await this.couponRepository.incrementUsedCount(coupon.id);
  }
}
