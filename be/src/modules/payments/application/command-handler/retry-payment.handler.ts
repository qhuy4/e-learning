import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpStatus } from '@nestjs/common';

import { RetryPaymentCommand } from '@/modules/payments/application/command/retry-payment.command';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';
import {
  PAYMENT_GATEWAY_SERVICE,
  PaymentGatewayService,
} from '@/modules/payments/domain/gateway/payment-gateway.interface';
import { Payment } from '@/modules/payments/domain/entity/payment.entity';
import { PaymentStatus } from '@/modules/payments/domain/enum/payment-status.enum';

@CommandHandler(RetryPaymentCommand)
export class RetryPaymentHandler
  implements ICommandHandler<RetryPaymentCommand>
{
  private readonly logger = new Logger(RetryPaymentHandler.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,

    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly gatewayService: PaymentGatewayService,
  ) {}

  async execute(command: RetryPaymentCommand) {
    const oldPayment = await this.paymentRepository.findById(
      command.data.paymentId,
    );

    if (!oldPayment) {
      throw new AppException(ErrorCode.PAYMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (
      oldPayment.status !== PaymentStatus.FAILED &&
      oldPayment.status !== PaymentStatus.CANCELLED
    ) {
      throw new AppException(ErrorCode.PAYMENT_CANNOT_CANCEL, HttpStatus.NOT_FOUND);
    }

    const gateway = command.data.gateway ?? oldPayment.gateway;

    const newPayment = Payment.create({
      orderId: oldPayment.orderId,
      gateway,
      amount: oldPayment.amount,
      currency: oldPayment.currency,
    });

    const created = await this.paymentRepository.create(newPayment);

    try {
      const result = await this.gatewayService.createPaymentUrl({
        orderId: created.orderId,
        amount: created.amount,
        currency: created.currency,
      });

      created.transactionId = result.transactionId;
      created.updateStatus(PaymentStatus.PROCESSING);
      await this.paymentRepository.update(created);

      this.logger.log(
        `Retry payment ${created.id} created for order ${created.orderId}`,
      );

      return {
        id: created.id,
        orderId: created.orderId,
        gateway: created.gateway,
        amount: created.amount,
        currency: created.currency,
        status: created.status,
        paymentUrl: result.paymentUrl,
      };
    } catch (error) {
      created.markAsFailed({ error: (error as Error).message });
      await this.paymentRepository.update(created);
      throw error;
    }
  }
}
