import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';

import { CancelPaymentCommand } from '@/modules/payments/application/command/cancel-payment.command';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';
import { PaymentStatus } from '@/modules/payments/domain/enum/payment-status.enum';

@CommandHandler(CancelPaymentCommand)
export class CancelPaymentHandler
  implements ICommandHandler<CancelPaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(command: CancelPaymentCommand) {
    const payment = await this.paymentRepository.findById(command.id);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${command.id} not found`);
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new NotFoundException('Cannot cancel a completed payment');
    }

    payment.updateStatus(PaymentStatus.CANCELLED);

    const updated = await this.paymentRepository.update(payment);

    return {
      id: updated.id,
      orderId: updated.orderId,
      gateway: updated.gateway,
      amount: updated.amount,
      currency: updated.currency,
      status: updated.status,
    };
  }
}
