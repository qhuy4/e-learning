import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { CouponOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon.orm-entity';
import { CouponCourseOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon-course.orm-entity';
import { CouponUsageOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon-usage.orm-entity';
import { CouponRepository } from '@/modules/coupons/infrastructure/repository/coupon.repository';
import { COUPON_REPOSITORY } from '@/modules/coupons/domain/repository/coupon.repository';

import { GetAdminCouponsHandler } from '@/modules/coupons/application/query-handler/get-admin-coupons.handler';
import { GetAdminCouponByIdHandler } from '@/modules/coupons/application/query-handler/get-admin-coupon-by-id.handler';
import { CreateCouponHandler } from '@/modules/coupons/application/command-handler/create-coupon.handler';
import { UpdateCouponHandler } from '@/modules/coupons/application/command-handler/update-coupon.handler';
import { DeleteCouponHandler } from '@/modules/coupons/application/command-handler/delete-coupon.handler';
import { ToggleCouponActiveHandler } from '@/modules/coupons/application/command-handler/toggle-coupon-active.handler';

import { AdminCouponsController } from '@/modules/coupons/presentation/admin-coupons.controller';

const QueryHandlers = [GetAdminCouponsHandler, GetAdminCouponByIdHandler];
const CommandHandlers = [
  CreateCouponHandler,
  UpdateCouponHandler,
  DeleteCouponHandler,
  ToggleCouponActiveHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([CouponOrmEntity, CouponCourseOrmEntity, CouponUsageOrmEntity]),
  ],
  controllers: [AdminCouponsController],
  providers: [
    CouponRepository,
    {
      provide: COUPON_REPOSITORY,
      useExisting: CouponRepository,
    },
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [COUPON_REPOSITORY],
})
export class CouponsModule {}
