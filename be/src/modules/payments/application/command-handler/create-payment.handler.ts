import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { CreatePaymentCommand } from '@/modules/payments/application/command/create-payment.command';
import { Payment } from '@/modules/payments/domain/entity/payment.entity';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler
  implements ICommandHandler<CreatePaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(command: CreatePaymentCommand) {
    const payment = Payment.create({
      orderId: command.data.orderId,
      gateway: command.data.gateway,
      amount: command.data.amount,
      currency: command.data.currency,
      transactionId: command.data.transactionId,
      status: command.data.status,
      gatewayResponse: command.data.gatewayResponse,
      paidAt: command.data.paidAt,
    });

    const created = await this.paymentRepository.create(payment);

    return {
      id: created.id,
      orderId: created.orderId,
      gateway: created.gateway,
      amount: created.amount,
      currency: created.currency,
      status: created.status,
    };
  }
}
