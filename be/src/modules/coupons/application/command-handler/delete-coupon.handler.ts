import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteCouponCommand } from '@/modules/coupons/application/command/delete-coupon.command';
import {
  ICouponRepository,
  COUPON_REPOSITORY,
} from '@/modules/coupons/domain/repository/coupon.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

@CommandHandler(DeleteCouponCommand)
export class DeleteCouponHandler implements ICommandHandler<DeleteCouponCommand> {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(command: DeleteCouponCommand) {
    const existing = await this.couponRepository.findById(command.data.id);
    if (!existing) {
      throw new AppException(ErrorCode.COUPON_NOT_FOUND, 404);
    }
    await this.couponRepository.softDelete(command.data.id);
  }
}
