import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdminOrdersQuery } from '@/modules/orders/application/query/get-admin-orders.query';
import { ORDER_REPOSITORY, IOrderRepository } from '@/modules/orders/domain/repository/order.repository';
import { Inject } from '@nestjs/common';

@QueryHandler(GetAdminOrdersQuery)
export class GetAdminOrdersHandler implements IQueryHandler<GetAdminOrdersQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetAdminOrdersQuery) {
    return this.orderRepository.findAll(query.data);
  }
}
