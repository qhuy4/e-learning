import { Payment } from '../entity/payment.entity';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface FindPaymentsOptions {
  page: number;
  limit: number;
  orderId?: number;
  status?: string;
  gateway?: string;
}

export interface IPaymentRepository {
  findById(id: number): Promise<Payment | null>;
  findByOrderId(orderId: number): Promise<Payment | null>;
  findAll(options: FindPaymentsOptions): Promise<{ payments: Payment[]; total: number }>;
  create(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<Payment>;
}
