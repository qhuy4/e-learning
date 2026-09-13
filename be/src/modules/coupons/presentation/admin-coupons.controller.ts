import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetAdminCouponsQuery } from '@/modules/coupons/application/query/get-admin-coupons.query';
import { GetAdminCouponByIdQuery } from '@/modules/coupons/application/query/get-admin-coupon-by-id.query';
import { CreateCouponCommand } from '@/modules/coupons/application/command/create-coupon.command';
import { UpdateCouponCommand } from '@/modules/coupons/application/command/update-coupon.command';
import { DeleteCouponCommand } from '@/modules/coupons/application/command/delete-coupon.command';
import { ToggleCouponActiveCommand } from '@/modules/coupons/application/command/toggle-coupon-active.command';
import { CreateCouponDto } from '@/modules/coupons/presentation/dto/create-coupon.dto';
import { UpdateCouponDto } from '@/modules/coupons/presentation/dto/update-coupon.dto';
import { AdminCouponListResponseMapper } from '@/modules/coupons/presentation/mapper/admin-coupon-list-response.mapper';

@Controller('admin/coupons')
@UseGuards(JwtAuthGuard)
export class AdminCouponsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword?: string,
    @Query('scope') scope?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.queryBus.execute(
      new GetAdminCouponsQuery({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        keyword,
        scope,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        sortBy,
        sortOrder,
      }),
    );

    return {
      data: result.data.map((coupon: any) => AdminCouponListResponseMapper.toResponse(coupon)),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const coupon = await this.queryBus.execute(new GetAdminCouponByIdQuery({ id }));
    return AdminCouponListResponseMapper.toResponse(coupon);
  }

  @Post()
  async create(@Body() dto: CreateCouponDto, @Request() req: any) {
    const coupon = await this.commandBus.execute(
      new CreateCouponCommand({
        createdBy: req.user.id,
        code: dto.code,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderAmount: dto.minOrderAmount,
        maxDiscountAmount: dto.maxDiscountAmount,
        usageLimit: dto.usageLimit,
        usageLimitPerUser: dto.usageLimitPerUser,
        scope: dto.scope,
        couponOwnerType: dto.couponOwnerType,
        validFrom: dto.validFrom,
        validUntil: dto.validUntil,
        description: dto.description,
        courseIds: dto.courseIds,
      }),
    );
    return AdminCouponListResponseMapper.toResponse(coupon);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    const coupon = await this.commandBus.execute(
      new UpdateCouponCommand({
        id,
        code: dto.code,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderAmount: dto.minOrderAmount,
        maxDiscountAmount: dto.maxDiscountAmount,
        usageLimit: dto.usageLimit,
        usageLimitPerUser: dto.usageLimitPerUser,
        scope: dto.scope,
        validFrom: dto.validFrom,
        validUntil: dto.validUntil,
        description: dto.description,
        courseIds: dto.courseIds,
      }),
    );
    return AdminCouponListResponseMapper.toResponse(coupon);
  }

  @Patch(':id/toggle')
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    const coupon = await this.commandBus.execute(new ToggleCouponActiveCommand({ id }));
    return AdminCouponListResponseMapper.toResponse(coupon);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.commandBus.execute(new DeleteCouponCommand({ id }));
  }
}
