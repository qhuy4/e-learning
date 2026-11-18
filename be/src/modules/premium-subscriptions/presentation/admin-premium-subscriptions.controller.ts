import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PremiumSubscriptionRepository } from '@/modules/premium-subscriptions/infrastructure/repository/premium-subscription.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@Controller('admin/premium-subscriptions')
@UseGuards(JwtAuthGuard)
export class AdminPremiumSubscriptionsController {
  constructor(private readonly repo: PremiumSubscriptionRepository) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.repo.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status: status !== undefined ? parseInt(status, 10) : undefined,
      keyword,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const sub = await this.repo.findById(id);
    if (!sub) throw new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND, 404);
    return sub;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { startedAt?: string; expiredAt?: string; status?: number },
  ) {
    const sub = await this.repo.findById(id);
    if (!sub) throw new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND, 404);

    const updateData: Record<string, unknown> = {};
    if (body.startedAt) updateData.startedAt = new Date(body.startedAt);
    if (body.expiredAt) updateData.expiredAt = new Date(body.expiredAt);
    if (body.status !== undefined) updateData.status = body.status;

    return this.repo.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.repo.remove(id);
    if (!result) throw new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND, 404);
    return result;
  }
}
