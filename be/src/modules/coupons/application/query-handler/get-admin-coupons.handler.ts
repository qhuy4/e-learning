import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminCouponsQuery } from '@/modules/coupons/application/query/get-admin-coupons.query';
import { ICouponRepository, COUPON_REPOSITORY } from '@/modules/coupons/domain/repository/coupon.repository';

@QueryHandler(GetAdminCouponsQuery)
export class GetAdminCouponsHandler implements IQueryHandler<GetAdminCouponsQuery> {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(query: GetAdminCouponsQuery) {
    return this.couponRepository.findAll(query.data);
  }
}
