import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, HttpStatus } from '@nestjs/common';
import { GetAdminOrderByIdQuery } from '@/modules/orders/application/query/get-admin-order-by-id.query';
import { ORDER_REPOSITORY, IOrderRepository } from '@/modules/orders/domain/repository/order.repository';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

@QueryHandler(GetAdminOrderByIdQuery)
export class GetAdminOrderByIdHandler implements IQueryHandler<GetAdminOrderByIdQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetAdminOrderByIdQuery) {
    const order = await this.orderRepository.findById(query.id);

    if (!order) {
      throw new AppException(ErrorCode.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return order;
  }
}
