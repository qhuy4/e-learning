import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateOrderStatusCommand } from '@/modules/orders/application/command/update-order-status.command';
import { ORDER_REPOSITORY, IOrderRepository } from '@/modules/orders/domain/repository/order.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { OrderStatus } from '@/modules/orders/domain/enum/order-status.enum';

const VALID_TRANSITIONS: Record<number, number[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.FAILED, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.REFUNDED],
  [OrderStatus.FAILED]: [OrderStatus.PENDING],
};

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler implements ICommandHandler<UpdateOrderStatusCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: UpdateOrderStatusCommand) {
    const { id, status } = command.data;

    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new AppException(ErrorCode.ORDER_NOT_FOUND, 404);
    }

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(status)) {
      throw new AppException(ErrorCode.ORDER_INVALID_STATUS_TRANSITION, 400);
    }

    return this.orderRepository.updateStatus(id, status);
  }
}
