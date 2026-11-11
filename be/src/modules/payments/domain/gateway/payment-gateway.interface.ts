export const PAYMENT_GATEWAY_SERVICE = Symbol('PAYMENT_GATEWAY_SERVICE');

export interface CreatePaymentInput {
  orderId: number;
  amount: number;
  currency: string;
  description?: string;
  /** Overrides the default gateway callback URL for a different payment flow. */
  returnUrl?: string;
}

export interface CreatePaymentOutput {
  paymentUrl: string;
  transactionId: string;
}

export interface RefundPaymentInput {
  transactionId: string;
  amount: number;
  reason?: string;
}

export interface RefundPaymentOutput {
  success: boolean;
  refundTransactionId: string;
  rawResponse: Record<string, any>;
}

export interface VerifyCallbackInput {
  query: Record<string, string>;
}

export interface VerifyCallbackOutput {
  transactionId: string;
  orderId: number;
  amount: number;
  status: 'success' | 'failed';
  rawResponse: Record<string, any>;
}

export interface PaymentGatewayService {
  createPaymentUrl(input: CreatePaymentInput): Promise<CreatePaymentOutput>;
  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput>;
  verifyCallback(input: VerifyCallbackInput): Promise<VerifyCallbackOutput>;
}
