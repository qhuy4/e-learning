import { Payment } from '@/modules/payments/domain/entity/payment.entity';

export class PaymentResponseDto {
  id: number;
  orderId: number;
  transactionId: string | null;
  gateway: string;
  amount: number;
  currency: string;
  status: number;
  gatewayResponse: Record<string, any> | null;
  paidAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;

  static fromDomain(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id!,
      orderId: payment.orderId,
      transactionId: payment.transactionId,
      gateway: payment.gateway,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      gatewayResponse: payment.gatewayResponse,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
