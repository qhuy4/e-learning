import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { CouponRedemptionService } from '@/modules/coupons/application/coupon-redemption.service';
import { ValidateCouponDto } from '@/modules/coupons/presentation/dto/validate-coupon.dto';

/**
 * API công khai (yêu cầu đăng nhập) cho client:
 *  - GET  /coupons/active?courseId=  → danh sách mã đang hiệu lực áp dụng cho khóa học
 *  - POST /coupons/validate          → kiểm tra mã + trả về số tiền giảm thực tế
 */
@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private readonly redemption: CouponRedemptionService) {}

  @Get('active')
  getActive(
    @CurrentUser('id') userId: number,
    @Query('courseId') courseId?: string,
    @Query('bookingMinutes') bookingMinutes?: string,
  ) {
    const parsed = courseId ? Number(courseId) : undefined;
    const parsedMinutes = bookingMinutes ? Number(bookingMinutes) : undefined;
    return this.redemption.listActiveForUser(
      userId,
      parsed !== undefined && !Number.isNaN(parsed) ? parsed : undefined,
      parsedMinutes !== undefined && !Number.isNaN(parsedMinutes)
        ? parsedMinutes
        : undefined,
    );
  }

  @Post('validate')
  validate(@CurrentUser('id') userId: number, @Body() dto: ValidateCouponDto) {
    if (!dto.code && !dto.couponId) {
      throw new BadRequestException('Vui lòng chọn mã giảm giá');
    }

    return (async () => {
      const { coupon, discountAmount } = await this.redemption.validate({
        userId,
        code: dto.code,
        couponId: dto.couponId,
        courseId: dto.courseId,
        amount: dto.amount ?? 0,
        bookingMinutes: dto.bookingMinutes,
      });
      return { ...this.redemption.toPublic(coupon), discountAmount };
    })();
  }
}
