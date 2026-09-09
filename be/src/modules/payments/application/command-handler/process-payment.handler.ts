import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';

import { ProcessPaymentCommand } from '@/modules/payments/application/command/process-payment.command';
import { Payment } from '@/modules/payments/domain/entity/payment.entity';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';
import {
  PAYMENT_GATEWAY_SERVICE,
  PaymentGatewayService,
} from '@/modules/payments/domain/gateway/payment-gateway.interface';
import { PaymentStatus } from '@/modules/payments/domain/enum/payment-status.enum';

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentHandler
  implements ICommandHandler<ProcessPaymentCommand>
{
  private readonly logger = new Logger(ProcessPaymentHandler.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,

    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly gatewayService: PaymentGatewayService,
  ) {}

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
      const result = await this.gatewayService.createPaymentUrl({
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
