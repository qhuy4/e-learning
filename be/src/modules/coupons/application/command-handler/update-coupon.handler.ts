import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateCouponCommand } from '@/modules/coupons/application/command/update-coupon.command';
import { ICouponRepository, COUPON_REPOSITORY } from '@/modules/coupons/domain/repository/coupon.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { ERROR_MESSAGES } from '@/common/constants/error.message';
import { AppException } from '@/common/exception/app.exception';

@CommandHandler(UpdateCouponCommand)
export class UpdateCouponHandler implements ICommandHandler<UpdateCouponCommand> {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(command: UpdateCouponCommand) {
    const existing = await this.couponRepository.findById(command.data.id);
    if (!existing) {
      throw new AppException(ErrorCode.COUPON_NOT_FOUND, 404);
    }

    if (command.data.code && command.data.code.toUpperCase() !== existing.code) {
      const byCode = await this.couponRepository.findByCode(command.data.code.toUpperCase());
      if (byCode && byCode.id !== command.data.id) {
        throw new AppException(ErrorCode.COUPON_CODE_EXISTS, 409);
      }
    }

    const updateData: any = {};
    if (command.data.code !== undefined) updateData.code = command.data.code.toUpperCase();
    if (command.data.discountType !== undefined) updateData.discountType = command.data.discountType;
    if (command.data.discountValue !== undefined) updateData.discountValue = command.data.discountValue;
    if (command.data.minOrderAmount !== undefined) updateData.minOrderAmount = command.data.minOrderAmount;
    if (command.data.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = command.data.maxDiscountAmount ?? null;
    if (command.data.usageLimit !== undefined) updateData.usageLimit = command.data.usageLimit ?? null;
    if (command.data.usageLimitPerUser !== undefined) updateData.usageLimitPerUser = command.data.usageLimitPerUser;
    if (command.data.scope !== undefined) updateData.scope = command.data.scope;
    if (command.data.validFrom !== undefined) updateData.validFrom = new Date(command.data.validFrom);
    if (command.data.validUntil !== undefined) updateData.validUntil = command.data.validUntil ? new Date(command.data.validUntil) : null;
    if (command.data.description !== undefined) updateData.description = command.data.description ?? null;
    if (command.data.courseIds !== undefined) updateData.courseIds = command.data.courseIds;

    return this.couponRepository.update(command.data.id, updateData);
  }
}
