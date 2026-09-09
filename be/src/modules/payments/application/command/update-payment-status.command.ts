import { PaymentStatus } from '@/modules/payments/domain/enum/payment-status.enum';

export class UpdatePaymentStatusCommand {
  constructor(
    public readonly data: {
      id: number;
      status: PaymentStatus;
      transactionId?: string;
      gatewayResponse?: Record<string, any>;
    },
  ) {}
}
