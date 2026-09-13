import { PaymentOrmEntity } from '../entity/payment.orm-entity';
import { Payment } from '@/modules/payments/domain/entity/payment.entity';

export class PaymentMapper {
  static toDomain(entity: PaymentOrmEntity): Payment {
    return Payment.restore({
      id: entity.id,
      orderId: entity.orderId,
      transactionId: entity.transactionId ?? null,
      gateway: entity.gateway,
      amount: Number(entity.amount),
      currency: entity.currency,
      status: entity.status,
      gatewayResponse: entity.gatewayResponse ?? null,
      paidAt: entity.paidAt ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: Payment): PaymentOrmEntity {
    const entity = new PaymentOrmEntity();
    if (domain.id !== null) entity.id = domain.id;
    entity.orderId = domain.orderId;
    entity.transactionId = domain.transactionId ?? undefined;
    entity.gateway = domain.gateway;
    entity.amount = domain.amount;
    entity.currency = domain.currency;
    entity.status = domain.status;
    entity.gatewayResponse = domain.gatewayResponse ?? undefined;
    entity.paidAt = domain.paidAt ?? undefined;
    return entity;
  }
}
