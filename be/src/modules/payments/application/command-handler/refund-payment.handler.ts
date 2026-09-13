import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';

import { RefundPaymentCommand } from '@/modules/payments/application/command/refund-payment.command';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';
import {
  PAYMENT_GATEWAY_SERVICE,
  PaymentGatewayService,
} from '@/modules/payments/domain/gateway/payment-gateway.interface';
import { PaymentStatus } from '@/modules/payments/domain/enum/payment-status.enum';

@CommandHandler(RefundPaymentCommand)
export class RefundPaymentHandler
  implements ICommandHandler<RefundPaymentCommand>
{
  private readonly logger = new Logger(RefundPaymentHandler.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,

    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly gatewayService: PaymentGatewayService,
  ) {}

  async execute(command: RefundPaymentCommand) {
    const payment = await this.paymentRepository.findById(command.data.id);

    if (!payment) {
      throw new NotFoundException(
        `Payment with ID ${command.data.id} not found`,
      );
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new NotFoundException(
        `Cannot refund payment with status ${payment.status}`,
      );
    }

    if (!payment.transactionId) {
      throw new NotFoundException('Payment has no transaction ID');
    }

    const result = await this.gatewayService.refundPayment({
      transactionId: payment.transactionId,
      amount: payment.amount,
      reason: command.data.reason,
    });

    if (result.success) {
      payment.markAsRefunded({
        refundTransactionId: result.refundTransactionId,
        ...result.rawResponse,
      });
    } else {
      this.logger.error(
        `Refund failed for payment ${payment.id}: ${JSON.stringify(result.rawResponse)}`,
      );
      throw new NotFoundException('Refund failed');
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
    };
  }
}
