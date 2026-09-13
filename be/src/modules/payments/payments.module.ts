import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentOrmEntity } from '@/modules/payments/infrastructure/entity/payment.orm-entity';
import { PaymentRepository } from '@/modules/payments/infrastructure/repository/payment.repository';
import { PAYMENT_REPOSITORY } from '@/modules/payments/domain/repository/payment.repository';

import { PAYMENT_GATEWAY_SERVICE } from '@/modules/payments/domain/gateway/payment-gateway.interface';
import { VnpayService } from '@/modules/payments/infrastructure/gateway/vnpay/vnpay.service';
import { StripeService } from '@/modules/payments/infrastructure/gateway/stripe/stripe.service';

import { PaymentsController } from '@/modules/payments/presentation/payments.controller';
import { PaymentWebhookController } from '@/modules/payments/presentation/payment-webhook.controller';

import { CreatePaymentHandler } from '@/modules/payments/application/command-handler/create-payment.handler';
import { ProcessPaymentHandler } from '@/modules/payments/application/command-handler/process-payment.handler';
import { UpdatePaymentStatusHandler } from '@/modules/payments/application/command-handler/update-payment-status.handler';
import { CancelPaymentHandler } from '@/modules/payments/application/command-handler/cancel-payment.handler';
import { ProcessPaymentCallbackHandler } from '@/modules/payments/application/command-handler/process-payment-callback.handler';
import { RefundPaymentHandler } from '@/modules/payments/application/command-handler/refund-payment.handler';
import { RetryPaymentHandler } from '@/modules/payments/application/command-handler/retry-payment.handler';

import { GetPaymentByIdHandler } from '@/modules/payments/application/query-handler/get-payment-by-id.handler';
import { GetPaymentByOrderIdHandler } from '@/modules/payments/application/query-handler/get-payment-by-order-id.handler';
import { GetPaymentsHandler } from '@/modules/payments/application/query-handler/get-payments.handler';

import { OrdersModule } from '@/modules/orders/orders.module';
import { EnrollmentsModule } from '@/modules/enrollments/enrollments.module';

const CommandHandlers = [
  CreatePaymentHandler,
  ProcessPaymentHandler,
  UpdatePaymentStatusHandler,
  CancelPaymentHandler,
  ProcessPaymentCallbackHandler,
  RefundPaymentHandler,
  RetryPaymentHandler,
];

const QueryHandlers = [
  GetPaymentByIdHandler,
  GetPaymentByOrderIdHandler,
  GetPaymentsHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([PaymentOrmEntity]),
    OrdersModule,
    EnrollmentsModule,
  ],
  controllers: [PaymentsController, PaymentWebhookController],
  providers: [
    PaymentRepository,
    {
      provide: PAYMENT_REPOSITORY,
      useExisting: PaymentRepository,
    },
    VnpayService,
    StripeService,
    {
      provide: PAYMENT_GATEWAY_SERVICE,
      useExisting: VnpayService,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [PAYMENT_REPOSITORY, PAYMENT_GATEWAY_SERVICE],
})
export class PaymentsModule {}
