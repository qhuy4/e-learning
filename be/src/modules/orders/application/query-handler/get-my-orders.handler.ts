import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetMyOrdersQuery } from '@/modules/orders/application/query/get-my-orders.query';
import {
  ORDER_REPOSITORY,
  IOrderRepository,
} from '@/modules/orders/domain/repository/order.repository';

@QueryHandler(GetMyOrdersQuery)
export class GetMyOrdersHandler implements IQueryHandler<GetMyOrdersQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetMyOrdersQuery) {
    const { userId, page, limit, status } = query.data;

    const { data, total } = await this.orderRepository.findAllByUser(userId, {
      page,
      limit,
      status,
    });

    return {
      data: data.map((order) => ({
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
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
