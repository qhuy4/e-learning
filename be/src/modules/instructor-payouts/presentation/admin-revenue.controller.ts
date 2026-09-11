import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetAdminRevenueSplitsQuery } from '@/modules/instructor-payouts/application/query/get-admin-revenue-splits.query';
import { GetAdminRevenueSummaryQuery } from '@/modules/instructor-payouts/application/query/get-admin-revenue-summary.query';
import { AdminRevenueResponseMapper } from '@/modules/instructor-payouts/presentation/mapper/admin-revenue-response.mapper';

@Controller('admin/revenue')
@UseGuards(JwtAuthGuard)
export class AdminRevenueController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('instructorId') instructorId?: string,
    @Query('courseId') courseId?: string,
    @Query('payoutStatus') payoutStatus?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.queryBus.execute(
      new GetAdminRevenueSplitsQuery({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        instructorId: instructorId ? parseInt(instructorId, 10) : undefined,
        courseId: courseId ? parseInt(courseId, 10) : undefined,
        payoutStatus,
        sortBy,
        sortOrder,
      }),
    );

    return {
      data: result.data.map((split: any) => AdminRevenueResponseMapper.toResponse(split)),
      meta: result.meta,
    };
  }

  @Get('summary')
  async getSummary(@Query('instructorId') instructorId?: string) {
    return this.queryBus.execute(
      new GetAdminRevenueSummaryQuery({
        instructorId: instructorId ? parseInt(instructorId, 10) : undefined,
      }),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.queryBus.execute(
      new GetAdminRevenueSplitsQuery({ page: 1, limit: 1 }),
    );
    // Use a dedicated query for single item - for now reuse
    return { id };
  }
}
