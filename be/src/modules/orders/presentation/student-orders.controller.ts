import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { CreateOrderCommand } from '@/modules/orders/application/command/create-order.command';
import { GetMyOrdersQuery } from '@/modules/orders/application/query/get-my-orders.query';
import { GetMyOrderByIdQuery } from '@/modules/orders/application/query/get-my-order-by-id.query';
import { CreateOrderDto } from '@/modules/orders/presentation/dto/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class StudentOrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@CurrentUser('id') userId: number, @Body() dto: CreateOrderDto) {
    return this.commandBus.execute(
      new CreateOrderCommand({
        userId,
        couponId: dto.couponId,
        items: dto.items,
      }),
    );
  }

  @Get('my')
  findMyOrders(
    @CurrentUser('id') userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.queryBus.execute(
      new GetMyOrdersQuery({
        userId,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        status,
      }),
    );
  }

  @Get('my/:id')
  findMyOrder(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.queryBus.execute(
      new GetMyOrderByIdQuery({ userId, id }),
    );
  }
}
