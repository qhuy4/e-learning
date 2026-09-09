import { PaymentGateway } from '@/modules/payments/domain/enum/payment-gateway.enum';
import { PaymentStatus } from '@/modules/payments/domain/enum/payment-status.enum';

export class CreatePaymentCommand {
  constructor(
    public readonly data: {
      orderId: number;
      gateway: PaymentGateway;
      amount: number;
      currency: string;
      transactionId?: string;
      status?: PaymentStatus;
      gatewayResponse?: Record<string, any>;
      paidAt?: Date;
    },
  ) {}
}
