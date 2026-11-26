import { BadRequestException } from '@nestjs/common';
import { CouponRedemptionService } from './coupon-redemption.service';
import { Coupon } from '@/modules/coupons/domain/entity/coupon.entity';
import { CouponType } from '@/modules/coupons/domain/enum/coupon-type.enum';
import { CouponScope } from '@/modules/coupons/domain/enum/coupon-scope.enum';
import { CouponOwnerType } from '@/modules/coupons/domain/enum/coupon-owner-type.enum';

const voucher = Coupon.restore({
  id: 1,
  createdBy: 9,
  code: 'REBOOK42',
  discountType: CouponType.PERCENTAGE,
  discountValue: 100,
  minOrderAmount: 0,
  maxDiscountAmount: null,
  usageLimit: 1,
  usageLimitPerUser: 1,
  usedCount: 0,
  scope: CouponScope.ALL,
  couponOwnerType: CouponOwnerType.INSTRUCTOR,
  isActive: true,
  validFrom: new Date('2026-01-01'),
  description: null,
  validUntil: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: null,
  recipientUserId: 7,
  maxBookingMinutes: 60,
});

describe('CouponRedemptionService booking vouchers', () => {
  const couponRepository = {
    findByCode: jest.fn().mockResolvedValue(voucher),
    findById: jest.fn().mockResolvedValue(voucher),
  };
  const usageRepository = { count: jest.fn().mockResolvedValue(0) };
  const service = new CouponRedemptionService(
    couponRepository as never,
    usageRepository as never,
  );

  it.each([30, 60])(
    'accepts a %i-minute booking for a 60-minute voucher',
    async (bookingMinutes) => {
      const result = await service.validate({
        userId: 7,
        couponId: 1,
        amount: 200_000,
        bookingMinutes,
      });

      expect(result.discountAmount).toBe(200_000);
    },
  );

  it('rejects a booking longer than the issued duration', async () => {
    await expect(
      service.validate({
        userId: 7,
        couponId: 1,
        amount: 300_000,
        bookingMinutes: 90,
      }),
    ).rejects.toThrow('tối đa 60 phút');
  });

  it('rejects use by another student', async () => {
    await expect(
      service.validate({
        userId: 8,
        couponId: 1,
        amount: 100_000,
        bookingMinutes: 30,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
