import { PaymentGateway } from '../enum/payment-gateway.enum';
import { PaymentStatus } from '../enum/payment-status.enum';

export class Payment {
  private constructor(
    public id: number | null,
    public orderId: number,
    public transactionId: string | null,
    public gateway: PaymentGateway,
    public amount: number,
    public currency: string,
    public status: PaymentStatus,
    public gatewayResponse: Record<string, any> | null,
    public paidAt: Date | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    orderId: number;
    gateway: PaymentGateway;
    amount: number;
    currency: string;
    transactionId?: string;
    status?: PaymentStatus;
    gatewayResponse?: Record<string, any>;
    paidAt?: Date;
  }): Payment {
    return new Payment(
      null,
      params.orderId,
      params.transactionId ?? null,
      params.gateway,
      params.amount,
      params.currency,
      params.status ?? PaymentStatus.PENDING,
      params.gatewayResponse ?? null,
      params.paidAt ?? null,
      new Date(),
      null,
    );
  }

  static restore(params: {
    id: number;
    orderId: number;
    transactionId: string | null;
    gateway: PaymentGateway;
    amount: number;
    currency: string;
    status: PaymentStatus;
    gatewayResponse: Record<string, any> | null;
    paidAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): Payment {
    return new Payment(
      params.id,
      params.orderId,
      params.transactionId,
      params.gateway,
      params.amount,
      params.currency,
      params.status,
      params.gatewayResponse,
      params.paidAt,
      params.createdAt,
      params.updatedAt,
    );
  }

  updateStatus(status: PaymentStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  markAsCompleted(transactionId: string, gatewayResponse?: Record<string, any>): void {
    this.status = PaymentStatus.COMPLETED;
    this.transactionId = transactionId;
    this.paidAt = new Date();
    this.gatewayResponse = gatewayResponse ?? this.gatewayResponse;
    this.updatedAt = new Date();
  }

  markAsFailed(gatewayResponse?: Record<string, any>): void {
    this.status = PaymentStatus.FAILED;
    this.gatewayResponse = gatewayResponse ?? this.gatewayResponse;
    this.updatedAt = new Date();
  }

  markAsRefunded(gatewayResponse?: Record<string, any>): void {
    this.status = PaymentStatus.REFUNDED;
    this.gatewayResponse = gatewayResponse ?? this.gatewayResponse;
    this.updatedAt = new Date();
  }
}
