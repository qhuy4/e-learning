import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCouponCommand } from '@/modules/coupons/application/command/create-coupon.command';
import {
  ICouponRepository,
  COUPON_REPOSITORY,
} from '@/modules/coupons/domain/repository/coupon.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

@CommandHandler(CreateCouponCommand)
export class CreateCouponHandler implements ICommandHandler<CreateCouponCommand> {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(command: CreateCouponCommand) {
    const existing = await this.couponRepository.findByCode(
      command.data.code.toUpperCase(),
    );
    if (existing) {
      throw new AppException(ErrorCode.COUPON_CODE_EXISTS, 409);
    }

    const now = new Date();
    return this.couponRepository.create({
      createdBy: String(command.data.createdBy),
      code: command.data.code.toUpperCase(),
      discountType: command.data.discountType || '0',
      discountValue: String(command.data.discountValue),
      minOrderAmount: String(command.data.minOrderAmount ?? 0),
      maxDiscountAmount:
        command.data.maxDiscountAmount != null
          ? String(command.data.maxDiscountAmount)
          : null,
      usageLimit: command.data.usageLimit ?? null,
      usageLimitPerUser: command.data.usageLimitPerUser ?? 1,
      usedCount: 0,
      scope: command.data.scope || '0',
      couponOwnerType: command.data.couponOwnerType || '0',
      isActive: true,
      validFrom: command.data.validFrom
        ? new Date(command.data.validFrom)
        : now,
      validUntil: command.data.validUntil
        ? new Date(command.data.validUntil)
        : null,
      description: command.data.description || null,
      courseIds: command.data.courseIds,
    });
  }
}
