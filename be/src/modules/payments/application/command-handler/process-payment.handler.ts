import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';

import { ProcessPaymentCommand } from '@/modules/payments/application/command/process-payment.command';
import { Payment } from '@/modules/payments/domain/entity/payment.entity';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';
import { PaymentStatus } from '@/modules/payments/domain/enum/payment-status.enum';
import { PaymentGateway } from '@/modules/payments/domain/enum/payment-gateway.enum';
import { VnpayService } from '@/modules/payments/infrastructure/gateway/vnpay/vnpay.service';
import { StripeService } from '@/modules/payments/infrastructure/gateway/stripe/stripe.service';

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentHandler
  implements ICommandHandler<ProcessPaymentCommand>
{
  private readonly logger = new Logger(ProcessPaymentHandler.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly vnpayService: VnpayService,
    private readonly stripeService: StripeService,
  ) {}

  private getGatewayService(gateway: PaymentGateway) {
    switch (gateway) {
      case PaymentGateway.STRIPE:
        return this.stripeService;
      default:
        return this.vnpayService;
    }
  }

  async execute(command: ProcessPaymentCommand) {
    const { orderId, gateway, amount, currency, description } = command.data;

    const payment = Payment.create({
      orderId,
      gateway,
      amount,
      currency,
    });

    const created = await this.paymentRepository.create(payment);

    try {
      const gatewayService = this.getGatewayService(gateway);
      const result = await gatewayService.createPaymentUrl({
        orderId,
        amount,
        currency,
        description,
      });

      created.transactionId = result.transactionId;
      created.updateStatus(PaymentStatus.PROCESSING);
      await this.paymentRepository.update(created);

      this.logger.log(
        `Payment ${created.id} created for order ${orderId}, gateway ${gateway}`,
      );

      return {
        id: created.id,
        orderId: created.orderId,
        gateway: created.gateway,
        amount: created.amount,
        currency: created.currency,
        status: created.status,
        transactionId: created.transactionId,
        paymentUrl: result.paymentUrl,
      };
    } catch (error) {
      created.markAsFailed({ error: (error as Error).message });
      await this.paymentRepository.update(created);
      this.logger.error(
        `Payment ${created.id} failed to create gateway URL: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
