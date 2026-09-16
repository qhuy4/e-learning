import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, HttpStatus } from '@nestjs/common';
import { GetAdminCouponByIdQuery } from '@/modules/coupons/application/query/get-admin-coupon-by-id.query';
import { ICouponRepository, COUPON_REPOSITORY } from '@/modules/coupons/domain/repository/coupon.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { ERROR_MESSAGES } from '@/common/constants/error.message';
import { AppException } from '@/common/exception/app.exception';

@QueryHandler(GetAdminCouponByIdQuery)
export class GetAdminCouponByIdHandler implements IQueryHandler<GetAdminCouponByIdQuery> {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(query: GetAdminCouponByIdQuery) {
    const coupon = await this.couponRepository.findById(query.data.id);
    if (!coupon) {
      throw new AppException(ErrorCode.COUPON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return coupon;
  }
}
