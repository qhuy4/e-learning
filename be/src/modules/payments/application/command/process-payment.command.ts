import { PaymentGateway } from '@/modules/payments/domain/enum/payment-gateway.enum';

export class ProcessPaymentCommand {
  constructor(
    public readonly data: {
      orderId: number;
      gateway: PaymentGateway;
      amount: number;
      currency: string;
      description?: string;
    },
  ) {}
}
