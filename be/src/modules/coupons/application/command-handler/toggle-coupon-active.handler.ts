import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ToggleCouponActiveCommand } from '@/modules/coupons/application/command/toggle-coupon-active.command';
import {
  ICouponRepository,
  COUPON_REPOSITORY,
} from '@/modules/coupons/domain/repository/coupon.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

@CommandHandler(ToggleCouponActiveCommand)
export class ToggleCouponActiveHandler implements ICommandHandler<ToggleCouponActiveCommand> {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(command: ToggleCouponActiveCommand) {
    const existing = await this.couponRepository.findById(command.data.id);
    if (!existing) {
      throw new AppException(ErrorCode.COUPON_NOT_FOUND, 404);
    }
    return this.couponRepository.toggleActive(command.data.id);
  }
}
