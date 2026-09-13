import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { PaymentOrmEntity } from '@/modules/payments/infrastructure/entity/payment.orm-entity';
import { Payment } from '@/modules/payments/domain/entity/payment.entity';
import {
  IPaymentRepository,
  FindPaymentsOptions,
} from '@/modules/payments/domain/repository/payment.repository';
import { PaymentMapper } from '@/modules/payments/infrastructure/mapper/payment.mapper';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly repository: Repository<PaymentOrmEntity>,
  ) {}

  async findById(id: number): Promise<Payment | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return PaymentMapper.toDomain(entity);
  }

  async findByOrderId(orderId: number): Promise<Payment | null> {
    const entity = await this.repository.findOne({ where: { orderId } });
    if (!entity) return null;
    return PaymentMapper.toDomain(entity);
  }

  async findAll(
    options: FindPaymentsOptions,
  ): Promise<{ payments: Payment[]; total: number }> {
    const { page, limit, orderId, status, gateway } = options;

    const where: FindOptionsWhere<PaymentOrmEntity> = {};

    if (orderId !== undefined) {
      where.orderId = orderId;
    }

    if (status) {
      where.status = status as PaymentOrmEntity['status'];
    }

    if (gateway) {
      where.gateway = gateway as PaymentOrmEntity['gateway'];
    }

    const [entities, total] = await this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      payments: entities.map(PaymentMapper.toDomain),
      total,
    };
  }

  async create(payment: Payment): Promise<Payment> {
    const entity = this.repository.create({
      orderId: payment.orderId,
      transactionId: payment.transactionId ?? undefined,
      gateway: payment.gateway,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      gatewayResponse: payment.gatewayResponse ?? undefined,
      paidAt: payment.paidAt ?? undefined,
    });

    const saved = await this.repository.save(entity);
    return PaymentMapper.toDomain(saved);
  }

  async update(payment: Payment): Promise<Payment> {
    await this.repository.update(
      { id: payment.id! },
      {
        transactionId: payment.transactionId ?? undefined,
        gateway: payment.gateway,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        gatewayResponse: payment.gatewayResponse ?? undefined,
        paidAt: payment.paidAt ?? undefined,
      },
    );

    const updated = await this.repository.findOne({
      where: { id: payment.id! },
    });
    if (!updated) throw new Error('Payment not found after update');
    return PaymentMapper.toDomain(updated);
  }
}
