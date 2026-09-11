import { Controller, Get, Post, Patch, Param, Query, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetAdminPayoutsQuery } from '@/modules/instructor-payouts/application/query/get-admin-payouts.query';
import { GetAdminPayoutDetailQuery } from '@/modules/instructor-payouts/application/query/get-admin-payout-detail.query';
import { CreatePayoutCommand } from '@/modules/instructor-payouts/application/command/create-payout.command';
import { UpdatePayoutStatusCommand } from '@/modules/instructor-payouts/application/command/update-payout-status.command';
import { CreatePayoutDto } from '@/modules/instructor-payouts/presentation/dto/create-payout.dto';
import { UpdatePayoutStatusDto } from '@/modules/instructor-payouts/presentation/dto/update-payout-status.dto';
import { AdminPayoutResponseMapper } from '@/modules/instructor-payouts/presentation/mapper/admin-payout-response.mapper';

@Controller('admin/payouts')
@UseGuards(JwtAuthGuard)
export class AdminPayoutsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('instructorId') instructorId?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.queryBus.execute(
      new GetAdminPayoutsQuery({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        instructorId: instructorId ? parseInt(instructorId, 10) : undefined,
        status: status !== undefined ? parseInt(status, 10) : undefined,
        sortBy,
        sortOrder,
      }),
    );

    return {
      data: result.data.map((payout: any) => AdminPayoutResponseMapper.toResponse(payout)),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const payout = await this.queryBus.execute(new GetAdminPayoutDetailQuery({ id }));
    return AdminPayoutResponseMapper.toResponse(payout);
  }

  @Post()
  async create(@Body() dto: CreatePayoutDto) {
    const payout = await this.commandBus.execute(
      new CreatePayoutCommand({
        instructorId: dto.instructorId,
        payoutAccountId: dto.payoutAccountId,
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
      }),
    );
    return AdminPayoutResponseMapper.toResponse(payout);
  }

  @Patch(':id')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePayoutStatusDto) {
    const payout = await this.commandBus.execute(
      new UpdatePayoutStatusCommand({
        id,
        status: dto.status,
        transactionRef: dto.transactionRef,
        paidAt: dto.paidAt,
        note: dto.note,
      }),
    );
    return AdminPayoutResponseMapper.toResponse(payout);
  }
}
