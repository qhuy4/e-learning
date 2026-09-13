import { PaymentGateway } from '@/modules/payments/domain/enum/payment-gateway.enum';

export class ProcessPaymentCallbackCommand {
  constructor(
    public readonly data: {
      gateway: PaymentGateway;
      transactionId: string;
      orderId: number;
      amount: number;
      status: string;
      rawResponse: Record<string, any>;
    },
  ) {}
}
