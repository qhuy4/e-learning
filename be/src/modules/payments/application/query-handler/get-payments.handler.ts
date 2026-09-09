import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPaymentsQuery } from '@/modules/payments/application/query/get-payments.query';
import {
  PAYMENT_REPOSITORY,
  IPaymentRepository,
} from '@/modules/payments/domain/repository/payment.repository';

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsHandler implements IQueryHandler<GetPaymentsQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(query: GetPaymentsQuery) {
    const { page, limit, orderId, status, gateway } = query.data;

    const { payments, total } = await this.paymentRepository.findAll({
      page,
      limit,
      orderId,
      status,
      gateway,
    });

    return {
      data: payments.map((p) => ({
        id: p.id,
        orderId: p.orderId,
        transactionId: p.transactionId,
        gateway: p.gateway,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
