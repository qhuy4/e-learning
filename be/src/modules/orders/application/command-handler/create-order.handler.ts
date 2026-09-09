import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';

import { CreateOrderCommand } from '@/modules/orders/application/command/create-order.command';
import { Order } from '@/modules/orders/domain/entity/order.entity';
import {
  ORDER_REPOSITORY,
  IOrderRepository,
} from '@/modules/orders/domain/repository/order.repository';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler
  implements ICommandHandler<CreateOrderCommand>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: CreateOrderCommand) {
    const { userId, couponId, items } = command.data;

    if (!items.length) {
      throw new BadRequestException('Order must have at least one item');
    }

    const courseIds = items.map((i) => i.courseId);
    const uniqueIds = new Set(courseIds);
    if (uniqueIds.size !== courseIds.length) {
      throw new BadRequestException('Duplicate courses in order');
    }

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice, 0);
    const total = items.reduce((sum, i) => sum + i.finalPrice, 0);
    const discountAmount = subtotal - total;

    const orderCode = `ODD${Date.now()}`;

    const order = Order.create({
      userId,
      couponId,
      orderCode,
      subtotal,
      discountAmount,
      total,
    });

    return this.orderRepository.create(order, items);
  }
}
