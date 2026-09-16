import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, HttpStatus } from '@nestjs/common';

import { GetMyOrderByIdQuery } from '@/modules/orders/application/query/get-my-order-by-id.query';
import {
  ORDER_REPOSITORY,
  IOrderRepository,
} from '@/modules/orders/domain/repository/order.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@QueryHandler(GetMyOrderByIdQuery)
export class GetMyOrderByIdHandler
  implements IQueryHandler<GetMyOrderByIdQuery>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetMyOrderByIdQuery) {
    const order = await this.orderRepository.findById(query.data.id);

    if (!order || order.userId !== query.data.userId) {
      throw new AppException(ErrorCode.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return {
      id: order.id,
      orderCode: order.orderCode,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      total: order.total,
      currency: order.currency,
      status: order.status,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      items: (order.items ?? []).map((item: any) => ({
        id: item.id,
        courseId: item.courseId,
        courseTitle: item.course?.title ?? '',
        courseThumbnail: item.course?.thumbnail ?? null,
        unitPrice: item.unitPrice,
        finalPrice: item.finalPrice,
      })),
    };
  }
}
