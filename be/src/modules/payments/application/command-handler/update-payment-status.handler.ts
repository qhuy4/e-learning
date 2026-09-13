import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';

import { UpdatePaymentStatusCommand } from '@/modules/payments/application/command/update-payment-status.command';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';

@CommandHandler(UpdatePaymentStatusCommand)
export class UpdatePaymentStatusHandler
  implements ICommandHandler<UpdatePaymentStatusCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(command: UpdatePaymentStatusCommand) {
    const { id, status, transactionId, gatewayResponse } = command.data;

    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    payment.updateStatus(status);

    if (transactionId) {
      payment.transactionId = transactionId;
    }

    if (gatewayResponse) {
      payment.markAsCompleted(transactionId ?? payment.transactionId!, gatewayResponse);
    }

    const updated = await this.paymentRepository.update(payment);

    return {
      id: updated.id,
      orderId: updated.orderId,
      gateway: updated.gateway,
      amount: updated.amount,
      currency: updated.currency,
      status: updated.status,
      transactionId: updated.transactionId,
      paidAt: updated.paidAt,
    };
  }
}
