import { PaymentGateway } from '@/modules/payments/domain/enum/payment-gateway.enum';

export class RetryPaymentCommand {
  constructor(
    public readonly data: {
      paymentId: number;
      gateway?: PaymentGateway;
    },
  ) {}
}
