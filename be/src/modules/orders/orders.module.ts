import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { OrderOrmEntity } from '@/modules/orders/infrastructure/entity/order.orm-entity';
import { OrderItemOrmEntity } from '@/modules/orders/infrastructure/entity/order-item.orm-entity';
import { OrderRepository } from '@/modules/orders/infrastructure/repository/order.repository';
import { ORDER_REPOSITORY } from '@/modules/orders/domain/repository/order.repository';

import { GetAdminOrdersHandler } from '@/modules/orders/application/query-handler/get-admin-orders.handler';
import { GetAdminOrderByIdHandler } from '@/modules/orders/application/query-handler/get-admin-order-by-id.handler';
import { UpdateOrderStatusHandler } from '@/modules/orders/application/command-handler/update-order-status.handler';

import { AdminOrdersController } from '@/modules/orders/presentation/admin-orders.controller';

const QueryHandlers = [GetAdminOrdersHandler, GetAdminOrderByIdHandler];
const CommandHandlers = [UpdateOrderStatusHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([OrderOrmEntity, OrderItemOrmEntity]),
  ],
  controllers: [AdminOrdersController],
  providers: [
    OrderRepository,
    {
      provide: ORDER_REPOSITORY,
      useExisting: OrderRepository,
    },
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
