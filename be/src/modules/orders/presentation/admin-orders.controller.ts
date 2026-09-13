import { Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAdminOrdersQuery } from '@/modules/orders/application/query/get-admin-orders.query';
import { GetAdminOrderByIdQuery } from '@/modules/orders/application/query/get-admin-order-by-id.query';
import { UpdateOrderStatusCommand } from '@/modules/orders/application/command/update-order-status.command';
import { AdminOrderDtoMapper } from '@/modules/orders/presentation/mappers/admin-order-dto.mapper';

@Controller('admin/orders')
export class AdminOrdersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetAdminOrdersQuery({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        keyword,
        status: status ? Number(status) : undefined,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      }),
    );

    return {
      data: result.data.map((order) => AdminOrderDtoMapper.toListDto(order)),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.queryBus.execute(new GetAdminOrderByIdQuery(id));
    return AdminOrderDtoMapper.toDetailDto(order);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    const order = await this.commandBus.execute(
      new UpdateOrderStatusCommand({ id, status: Number(status) }),
    );
    return AdminOrderDtoMapper.toDetailDto(order);
  }
}
